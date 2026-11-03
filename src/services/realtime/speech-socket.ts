import { runtimeConfig } from "../api/runtime-config";
import { tokenManager } from "../api/token-manager";
export type SpeechEvent = {
  type: string;
  requestId: string | null;
  answerId: string | null;
  data: Record<string, unknown>;
};
export type SpeechConnection = {
  command: (value: object) => void;
  audio: (value: ArrayBuffer) => void;
  close: () => void;
};

const MAX_FRAME_BYTES = 32_768;
// Above this WebSocket buffer size, new frames wait in a local FIFO queue instead of being dropped.
const SEND_HIGH_WATER_BYTES = 64_000;
// 16 kHz mono PCM16 is 32 KB/s, so this tolerates roughly 10 s of network stall before giving up.
const MAX_BACKLOG_BYTES = 320_000;
const DRAIN_INTERVAL_MS = 40;
const HEARTBEAT_MS = 10_000;
// Three missed heartbeats: treat the socket as half-open and let the caller recover.
const STALE_AFTER_MS = 35_000;

type Outgoing = string | ArrayBuffer;

export function connectSpeech(
  ticket: string,
  onEvent: (event: SpeechEvent) => void,
  onDisconnect: () => void,
  signal: AbortSignal,
): Promise<SpeechConnection> {
  const base = new URL(
    runtimeConfig.apiBaseUrl || window.location.origin,
    window.location.origin,
  );
  if (base.protocol !== "https:" && base.protocol !== "http:")
    return Promise.reject(new Error("Máy chủ speech không hợp lệ."));
  const url = new URL("/ws/interview/speech", base);
  url.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("ticket", ticket);
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Kết nối đã hủy."));
      return;
    }
    const ws = new WebSocket(url);
    let ready = false,
      intentional = false,
      closed = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let drainTimer: ReturnType<typeof setInterval> | undefined;
    let lastSeen = Date.now();
    // Audio and commands share one ordered queue so `answer.end` can never overtake queued audio.
    const queue: Outgoing[] = [];
    let queuedBytes = 0;
    const sizeOf = (item: Outgoing) =>
      typeof item === "string" ? item.length : item.byteLength;
    const stopDrain = () => {
      clearInterval(drainTimer);
      drainTimer = undefined;
    };
    const drain = () => {
      while (
        queue.length &&
        ws.readyState === WebSocket.OPEN &&
        ws.bufferedAmount < SEND_HIGH_WATER_BYTES
      ) {
        const item = queue.shift()!;
        queuedBytes -= sizeOf(item);
        ws.send(item);
      }
      if (!queue.length) stopDrain();
    };
    const send = (item: Outgoing, critical: boolean) => {
      if (!queue.length && ws.bufferedAmount < SEND_HIGH_WATER_BYTES) {
        ws.send(item);
        return;
      }
      if (
        !critical &&
        ws.bufferedAmount + queuedBytes + sizeOf(item) > MAX_BACKLOG_BYTES
      )
        throw new Error(
          "Mạng không theo kịp âm thanh. Đã dừng thu để tránh mất dữ liệu.",
        );
      queue.push(item);
      queuedBytes += sizeOf(item);
      drainTimer ??= setInterval(drain, DRAIN_INTERVAL_MS);
    };
    const timeout = setTimeout(
      () => fail("Máy chủ speech chưa sẵn sàng. Vui lòng thử lại."),
      20_000,
    );
    const close = () => {
      intentional = true;
      clearTimeout(timeout);
      clearInterval(heartbeat);
      stopDrain();
      queue.length = 0;
      queuedBytes = 0;
      signal.removeEventListener("abort", close);
      ws.close();
    };
    function lost() {
      if (closed) return;
      closed = true;
      clearTimeout(timeout);
      clearInterval(heartbeat);
      stopDrain();
      signal.removeEventListener("abort", close);
      if (!ready)
        reject(
          new Error(
            "Không thể mở kết nối speech. Kiểm tra phiên đăng nhập, Origin và trạng thái lượt thi.",
          ),
        );
      else if (!intentional) onDisconnect();
    }
    function fail(message: string) {
      if (!ready) reject(new Error(message));
      close();
      if (ready) onDisconnect();
    }
    const connection: SpeechConnection = {
      command(value) {
        if (!ready || ws.readyState !== WebSocket.OPEN)
          throw new Error("Kết nối speech đã đóng.");
        send(JSON.stringify(value), true);
      },
      audio(value) {
        if (!ready || ws.readyState !== WebSocket.OPEN)
          throw new Error("Mất kết nối khi gửi audio.");
        if (
          !value.byteLength ||
          value.byteLength % 2 ||
          value.byteLength > MAX_FRAME_BYTES
        )
          throw new Error("Khung âm thanh không hợp lệ.");
        send(value, false);
      },
      close,
    };
    signal.addEventListener("abort", close, { once: true });
    ws.onmessage = (message) => {
      try {
        lastSeen = Date.now();
        if (typeof message.data !== "string") throw new Error();
        const value: unknown = JSON.parse(message.data);
        if (!value || typeof value !== "object") throw new Error();
        const event = value as SpeechEvent;
        if (
          typeof event.type !== "string" ||
          !event.data ||
          typeof event.data !== "object" ||
          Array.isArray(event.data) ||
          (event.answerId !== null && typeof event.answerId !== "string") ||
          (event.requestId !== null && typeof event.requestId !== "string")
        )
          throw new Error();
        if (!ready) {
          if (
            event.type !== "session.ready" ||
            event.data.encoding !== "PCM_S16LE" ||
            event.data.sampleRate !== 16000 ||
            event.data.channels !== 1 ||
            event.data.ttsProvider !== "browser"
          )
            throw new Error();
          ready = true;
          clearTimeout(timeout);
          lastSeen = Date.now();
          heartbeat = setInterval(() => {
            try {
              if (!tokenManager.getToken()) fail("Phiên đăng nhập hết hạn.");
              else if (Date.now() - lastSeen > STALE_AFTER_MS)
                fail("Máy chủ speech không phản hồi. Kết nối có thể đã bị ngắt.");
              else if (ws.readyState === WebSocket.OPEN)
                connection.command({
                  type: "ping",
                  requestId: crypto.randomUUID(),
                });
            } catch {
              fail("Không thể duy trì kết nối speech.");
            }
          }, HEARTBEAT_MS);
          resolve(connection);
        } else onEvent(event);
      } catch {
        fail("Phản hồi speech không hợp lệ.");
      }
    };
    ws.onerror = lost;
    ws.onclose = lost;
  });
}
