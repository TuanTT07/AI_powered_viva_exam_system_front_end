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
    const timeout = setTimeout(
      () => fail("Máy chủ speech chưa sẵn sàng. Vui lòng thử lại."),
      20_000,
    );
    const close = () => {
      intentional = true;
      clearTimeout(timeout);
      clearInterval(heartbeat);
      signal.removeEventListener("abort", close);
      ws.close();
    };
    function lost() {
      if (closed) return;
      closed = true;
      clearTimeout(timeout);
      clearInterval(heartbeat);
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
        ws.send(JSON.stringify(value));
      },
      audio(value) {
        if (!ready || ws.readyState !== WebSocket.OPEN)
          throw new Error("Mất kết nối khi gửi audio.");
        if (ws.bufferedAmount + value.byteLength > 64_000)
          throw new Error(
            "Mạng không theo kịp âm thanh. Đã dừng thu để tránh mất dữ liệu.",
          );
        if (
          !value.byteLength ||
          value.byteLength % 2 ||
          value.byteLength > 32768
        )
          throw new Error("Khung âm thanh không hợp lệ.");
        ws.send(value);
      },
      close,
    };
    signal.addEventListener("abort", close, { once: true });
    ws.onmessage = (message) => {
      try {
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
          heartbeat = setInterval(() => {
            try {
              if (!tokenManager.getToken()) fail("Phiên đăng nhập hết hạn.");
              else if (ws.readyState === WebSocket.OPEN)
                connection.command({
                  type: "ping",
                  requestId: crypto.randomUUID(),
                });
            } catch {
              fail("Không thể duy trì kết nối speech.");
            }
          }, 10_000);
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
