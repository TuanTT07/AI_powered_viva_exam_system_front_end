export type PcmCapture = {
  start: () => void;
  finish: () => Promise<void>;
  cancel: () => void;
};
export async function preparePcmCapture(
  onAudio: (value: ArrayBuffer) => void,
  onFailure: (message: string) => void,
  signal: AbortSignal,
): Promise<PcmCapture> {
  if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode)
    throw new Error(
      "Trình duyệt chưa hỗ trợ thu âm PCM. Hãy dùng HTTPS hoặc localhost trên trình duyệt mới.",
    );
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
  let audio: AudioContext | undefined,
    node: AudioWorkletNode | undefined,
    source: MediaStreamAudioSourceNode | undefined;
  let closed = false,
    started = false;
  let flushDone: (() => void) | undefined;
  // The microphone is opened as soon as the student asks to answer, but frames are only sent after the
  // server confirms `answer.started`. Frames captured in between are kept here so the first words survive
  // the network round trip. Bounded to ~1 s (20 x 50 ms) and discarded on cancel.
  const preRoll: ArrayBuffer[] = [];
  const MAX_PRE_ROLL_FRAMES = 20;
  const cancel = () => {
    if (closed) return;
    closed = true;
    started = false;
    preRoll.length = 0;
    signal.removeEventListener("abort", cancel);
    for (const track of stream.getTracks()) {
      track.onended = null;
      track.stop();
    }
    source?.disconnect();
    node?.disconnect();
    if (audio && audio.state !== "closed") void audio.close().catch(() => {});
  };
  try {
    if (signal.aborted) throw new Error("Thu âm đã hủy.");
    signal.addEventListener("abort", cancel, { once: true });
    try {
      audio = new AudioContext({ sampleRate: 16000 });
    } catch {
      audio = new AudioContext();
    }
    await audio.resume();
    await audio.audioWorklet.addModule(
      new URL("./pcm-capture.worklet.js?no-inline", import.meta.url).href,
    );
    if (closed || signal.aborted || audio.state !== "running")
      throw new Error("Không thể mở bộ xử lý âm thanh. Vui lòng thử lại.");
    node = new AudioWorkletNode(audio, "aives-pcm-capture");
    source = audio.createMediaStreamSource(stream);
    node.connect(audio.destination); // Worklet outputs silence; microphone is never played back.
    const deliver = (frame: ArrayBuffer) => {
      try {
        onAudio(frame);
        return true;
      } catch (error) {
        cancel();
        onFailure(
          error instanceof Error ? error.message : "Không thể gửi âm thanh.",
        );
        return false;
      }
    };
    node.port.onmessage = ({ data }) => {
      if (data === "flushed") {
        flushDone?.();
        return;
      }
      if (closed || !(data instanceof ArrayBuffer)) return;
      if (!started) {
        preRoll.push(data);
        if (preRoll.length > MAX_PRE_ROLL_FRAMES) preRoll.shift();
        return;
      }
      deliver(data);
    };
    // Browsers may suspend audio when the tab is hidden, the OS reclaims the mic, or Safari reports
    // "interrupted". Try to resume once; if capture cannot continue, stop loudly instead of sending silence.
    const context = audio;
    context.onstatechange = () => {
      if (closed || (context.state as string) === "running") return;
      if (context.state === "closed") return;
      void context.resume().catch(() => {});
      setTimeout(() => {
        if (!closed && (context.state as string) !== "running") {
          cancel();
          onFailure(
            "Trình duyệt đã tạm dừng thu âm (tab bị ẩn hoặc micro bị chiếm dụng). Hãy bấm trả lời lại.",
          );
        }
      }, 3000);
    };
    source.connect(node);
    node.onprocessorerror = () => {
      cancel();
      onFailure("Bộ xử lý âm thanh đã dừng. Vui lòng kết nối lại.");
    };
    for (const track of stream.getAudioTracks())
      track.onended = () => {
        cancel();
        onFailure("Micro đã ngắt kết nối.");
      };
    return {
      start() {
        if (closed) throw new Error("Micro đã đóng.");
        started = true;
        for (const frame of preRoll.splice(0)) {
          if (!deliver(frame)) return;
        }
      },
      async finish() {
        if (closed)
          throw new Error("Micro đã đóng trước khi gửi hết âm thanh.");
        try {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
              flushDone = undefined;
              reject(
                new Error("Chưa gửi hết âm thanh. Vui lòng kiểm tra kết nối."),
              );
            }, 1500);
            flushDone = () => {
              clearTimeout(timer);
              resolve();
            };
            source?.disconnect();
            node!.port.postMessage("flush");
          });
        } finally {
          cancel();
        }
      },
      cancel,
    };
  } catch (error) {
    cancel();
    throw error;
  }
}
