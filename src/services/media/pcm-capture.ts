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
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    video: false,
  });
  let audio: AudioContext | undefined,
    node: AudioWorkletNode | undefined,
    source: MediaStreamAudioSourceNode | undefined;
  let closed = false,
    started = false;
  let flushDone: (() => void) | undefined;
  const cancel = () => {
    if (closed) return;
    closed = true;
    started = false;
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
    node.port.onmessage = ({ data }) => {
      if (data === "flushed") {
        flushDone?.();
        return;
      }
      if (!started || closed || !(data instanceof ArrayBuffer)) return;
      try {
        onAudio(data);
      } catch (error) {
        cancel();
        onFailure(
          error instanceof Error ? error.message : "Không thể gửi âm thanh.",
        );
      }
    };
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
        source!.connect(node!);
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
