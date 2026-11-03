export async function speakVietnamese(
  text: string,
  language: string,
  signal: AbortSignal,
): Promise<void> {
  if (!("speechSynthesis" in window))
    throw new Error(
      "Trình duyệt không hỗ trợ đọc câu hỏi. Bạn có thể đọc nội dung trên màn hình.",
    );
  const synth = window.speechSynthesis;
  if (!synth.getVoices().length && !signal.aborted)
    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        synth.removeEventListener("voiceschanged", done);
        signal.removeEventListener("abort", done);
        resolve();
      };
      const timer = setTimeout(done, 2000);
      synth.addEventListener("voiceschanged", done);
      signal.addEventListener("abort", done, { once: true });
    });
  if (signal.aborted) return;
  const voice = synth.getVoices().find((v) => /^vi(?:-|$)/i.test(v.lang));
  if (!voice)
    throw new Error(
      "Máy chưa có giọng tiếng Việt. Bạn có thể đọc câu hỏi trên màn hình.",
    );
  await new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      utterance.onend = null;
      utterance.onerror = null;
    };
    const cancel = () => {
      cleanup();
      synth.cancel();
      resolve();
    };
    const timer = setTimeout(() => {
      cleanup();
      synth.cancel();
      reject(
        new Error(
          "Không thể hoàn tất phát câu hỏi. Vui lòng đọc nội dung trên màn hình.",
        ),
      );
    }, 180_000);
    utterance.lang = language;
    utterance.voice = voice;
    utterance.onend = () => {
      cleanup();
      resolve();
    };
    utterance.onerror = () => {
      cleanup();
      reject(
        new Error(
          "Không phát được câu hỏi. Vui lòng đọc nội dung trên màn hình.",
        ),
      );
    };
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
    else {
      synth.cancel();
      synth.speak(utterance);
    }
  });
}
