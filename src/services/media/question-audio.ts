/** Play authenticated backend audio; cancellation always releases the object URL. */
export async function playQuestionAudio(blob: Blob, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const done = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", cancel);
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        if (error) reject(error); else resolve();
      };
      const cancel = () => done();
      const timer = setTimeout(() => done(new Error("Phát câu hỏi quá thời gian. Vui lòng thử lại.")), 600_000);
      audio.onended = () => done();
      audio.onerror = () => done(new Error("Không phát được audio câu hỏi. Vui lòng thử lại."));
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) cancel();
      else audio.play().catch(() => done(new Error("Không phát được audio. Hãy nhấn nghe lại câu hỏi.")));
    });
  } finally {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(url);
  }
}
