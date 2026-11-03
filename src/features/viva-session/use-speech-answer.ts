import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ApiError } from "../../services/api/client";
import {
  connectSpeech,
  type SpeechConnection,
  type SpeechEvent,
} from "../../services/realtime/speech-socket";
import {
  preparePcmCapture,
  type PcmCapture,
} from "../../services/media/pcm-capture";
import { speakVietnamese } from "../../services/media/browser-tts";
import { isSpeechUuid, speechApi, type AnswerReceipt } from "./speech-api";
import {
  initialSpeechState,
  speechDraft,
  speechReducer,
  type SpeechAction,
} from "./speech-session-model";

export function useSpeechAnswer(
  attemptId: string,
  turnId: string,
  userId: string,
  active: boolean,
) {
  const [state, reactDispatch] = useReducer(speechReducer, initialSpeechState);
  const [audioLevel, setAudioLevel] = useState(0);
  const [clientDraft, setClientDraft] = useState("");
  const clientDraftRef = useRef(clientDraft);
  useEffect(() => {
    clientDraftRef.current = clientDraft;
  }, [clientDraft]);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const current = useRef(initialSpeechState);
  const getPhase = useCallback(() => current.current.phase, []);
  const dispatch = useCallback((action: SpeechAction) => {
    current.current = speechReducer(current.current, action);
    reactDispatch(action);
  }, []);
  const socket = useRef<SpeechConnection | null>(null);
  const capture = useRef<PcmCapture | null>(null);
  const controller = useRef<AbortController | null>(null);
  const tts = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const pending = useRef<string | null>(null);
  const startRequest = useRef<string | null>(null);
  const endRequest = useRef<string | null>(null);
  const serverFinalizing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const turnIdRef = useRef(turnId);
  useEffect(() => {
    turnIdRef.current = turnId;
  }, [turnId]);
  const key = `aives-speech:${userId}:${attemptId}:${turnId}`;

  const release = useCallback(() => {
    clearTimeout(timer.current);
    tts.current?.abort();
    setAudioLevel(0);
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    recognitionRef.current = null;
    setClientDraft("");
    capture.current?.cancel();
    capture.current = null;
    socket.current?.close();
    socket.current = null;
    controller.current?.abort();
  }, []);
  const dispose = useCallback(() => {
    generation.current++;
    release();
  }, [release]);
  const fail = useCallback(
    (message: string, disconnected = false) => {
      if (getPhase() === "saved") return;
      dispose();
      dispatch({ type: "ERROR", message, disconnected });
    },
    [dispose, dispatch, getPhase],
  );
  const saved = useCallback(
    (answerId: string, receipt: AnswerReceipt) => {
      if (pending.current !== answerId) return;
      clearTimeout(timer.current);
      setAudioLevel(0);
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
      setClientDraft("");
      capture.current?.cancel();
      capture.current = null;
      dispatch({ type: "SAVED", answerId, receipt });
      // Keep socket.current open across questions; ping heartbeat maintains the connection
      pending.current = null;
      startRequest.current = null;
      endRequest.current = null;
      serverFinalizing.current = false;
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    },
    [dispatch, key],
  );
  const lookup = useCallback(
    async (answerId: string, signal: AbortSignal) => {
      dispatch({ type: "CHECK", answerId });
      try {
        const receipt = await speechApi.answer(attemptId, answerId, signal);
        if (!signal.aborted) saved(answerId, receipt);
      } catch (error) {
        if (signal.aborted) return;
        const message =
          error instanceof ApiError && error.status === 404
            ? "Chưa tìm thấy câu trả lời đã lưu. Hãy kiểm tra lại sau hoặc liên hệ giảng viên; không thu đè khi chưa xác minh."
            : error instanceof Error
              ? error.message
              : "Chưa xác nhận được câu trả lời đã lưu.";
        dispatch({ type: "ERROR", message });
      }
    },
    [attemptId, dispatch, saved],
  );

  const handleEvent = useCallback(
    (event: SpeechEvent) => {
      const data = event.data;
      switch (event.type) {
        case "answer.started": {
          if (
            event.requestId !== startRequest.current ||
            data.questionTurnId !== turnIdRef.current ||
            getPhase() !== "starting"
          )
            return;
          if (
            !isSpeechUuid(event.answerId) ||
            typeof data.deadline !== "string" ||
            !Number.isFinite(Date.parse(data.deadline))
          )
            throw new Error("Deadline không hợp lệ.");
          clearTimeout(timer.current);
          pending.current = event.answerId;
          // Persist only recovery IDs, never audio or transcript; bind them to this authenticated student/prompt.
          sessionStorage.setItem(key, event.answerId);
          dispatch({
            type: "STARTED",
            answerId: event.answerId,
            deadline: data.deadline,
          });
          capture.current?.start();
          try {
            setClientDraft("");
            type SpeechRecCtor = new () => {
              continuous: boolean;
              interimResults: boolean;
              lang: string;
              onresult: (e: any) => void;
              onerror: () => void;
              start: () => void;
              stop: () => void;
            };
            const Win = window as unknown as {
              SpeechRecognition?: SpeechRecCtor;
              webkitSpeechRecognition?: SpeechRecCtor;
            };
            const SpeechRec = Win.SpeechRecognition || Win.webkitSpeechRecognition;
            if (SpeechRec) {
              const rec = new SpeechRec();
              rec.continuous = true;
              rec.interimResults = true;
              rec.lang = "vi-VN";
              rec.onresult = (e: any) => {
                let combined = "";
                for (let i = 0; i < e.results.length; i++) {
                  combined += e.results[i][0].transcript + " ";
                }
                const trimmed = combined.trim();
                if (trimmed) setClientDraft(trimmed);
              };
              rec.onerror = () => {};
              rec.start();
              recognitionRef.current = rec;
            }
          } catch {
            // Ignore
          }
          break;
        }
        case "transcript.partial":
        case "transcript.final": {
          if (event.answerId && pending.current && event.answerId !== pending.current) return;
          const targetAnswerId = pending.current || event.answerId;
          if (!targetAnswerId) return;

          const rawSegmentId = data.segmentId ?? 0;
          const segmentId = String(rawSegmentId);
          const revision = typeof data.revision === "number" ? data.revision : 0;
          const text = typeof data.text === "string" ? data.text : "";
          if (!text) return;

          dispatch({
            type: "SEGMENT",
            answerId: targetAnswerId,
            segmentId,
            revision,
            text,
            final: event.type === "transcript.final",
          });
          break;
        }
        case "answer.finalizing":
          if (event.answerId !== pending.current) return;
          serverFinalizing.current = true;
          clearTimeout(timer.current);
          capture.current?.cancel();
          capture.current = null;
          dispatch({ type: "FINALIZING" });
          timer.current = setTimeout(() => {
            fail(
              "Chưa nhận được xác nhận lưu. Hãy tra cứu câu trả lời trước khi tiếp tục.",
            );
          }, 60_000);
          break;
        case "answer.finalized":
          if (
            event.answerId !== pending.current ||
            (event.requestId !== null &&
              event.requestId !== endRequest.current &&
              event.requestId !== startRequest.current)
          )
            return;
          {
            const finalizedTurnId = isSpeechUuid(data.transcriptTurnId)
              ? data.transcriptTurnId
              : (isSpeechUuid(event.answerId) ? event.answerId : (pending.current || crypto.randomUUID()));
            const finalizedText = (typeof data.text === "string" && data.text.trim())
              ? data.text.trim()
              : (clientDraftRef.current.trim() || speechDraft(current.current).trim() || "Đã ghi nhận câu trả lời");
            saved(event.answerId || pending.current!, {
              transcriptTurnId: finalizedTurnId,
              text: finalizedText,
            });
          }
          break;
        case "speech.error": {
          if (serverFinalizing.current && data.code === "INVALID_STATE") return;
          if (getPhase() === "saved") return;
          if (event.answerId && event.answerId !== pending.current) return;
          if (
            event.requestId &&
            event.requestId !== startRequest.current &&
            event.requestId !== endRequest.current
          )
            return;
          const noSpeech = data.code === "NO_SPEECH";
          if (noSpeech) {
            pending.current = null;
            try {
              sessionStorage.removeItem(key);
            } catch {
              /* Receipt lookup remains the recovery boundary. */
            }
          }
          fail(
            typeof data.message === "string"
              ? data.message
              : "Dịch vụ speech gặp lỗi.",
          );
          if (noSpeech)
            dispatch({
              type: "ERROR",
              message:
                "Chưa nhận dạng được lời nói; câu trả lời chưa được lưu. Bạn có thể kết nối lại và thu lại nếu lượt hỏi còn mở.",
              clearAnswer: true,
            });
          break;
        }
      }
    },
    [dispatch, fail, key, saved, getPhase],
  );

  const connect = useCallback(async () => {
    const phase = getPhase();
    if (
      [
        "connecting",
        "starting",
        "recording",
        "finalizing",
        "checking",
        "speaking",
      ].includes(phase)
    )
      return;

    // If socket is already open and ready, reuse it and only fetch question playback
    if (socket.current) {
      dispatch({ type: "CONNECT" });
      try {
        const question = await speechApi.playback(attemptId, turnId);
        dispatch({ type: "READY", question });
        return;
      } catch (error) {
        fail(error instanceof Error ? error.message : "Không thể lấy nội dung câu hỏi.");
        return;
      }
    }

    release();
    const id = ++generation.current;
    const abort = new AbortController();
    controller.current = abort;
    dispatch({ type: "CONNECT" });
    try {
      if (!pending.current) {
        const stored = sessionStorage.getItem(key);
        if (isSpeechUuid(stored)) pending.current = stored;
      }
      if (pending.current) {
        await lookup(pending.current, abort.signal);
        return;
      }
      if (!active)
        throw new Error(
          "Lượt thi chưa được mở hoặc đã kết thúc. Vui lòng liên hệ giảng viên.",
        );
      const question = await speechApi.playback(
        attemptId,
        turnId,
        abort.signal,
      );
      const onEvent = (event: SpeechEvent) => {
        if (id !== generation.current) return;
        try {
          handleEvent(event);
        } catch {
          fail(
            "Phản hồi speech hoặc lưu mã khôi phục không hợp lệ. Đã dừng thu âm.",
          );
        }
      };
      // Between answers nothing is in flight, so a dropped socket is safe to replace silently.
      // Once an answer exists the audio cannot be replayed, so that case still fails explicitly.
      const reopen = async () => {
        socket.current = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
          if (id !== generation.current || abort.signal.aborted) return;
          try {
            const next = await open();
            if (id !== generation.current || abort.signal.aborted) {
              next.close();
              return;
            }
            socket.current = next;
            return;
          } catch {
            // Retry with backoff.
          }
        }
        if (id === generation.current)
          fail(
            "Mất kết nối speech và chưa thể nối lại. Hãy bấm kết nối lại âm thanh.",
            true,
          );
      };
      const onLost = () => {
        if (id !== generation.current) return;
        if (!pending.current && ["ready", "speaking"].includes(getPhase())) {
          void reopen();
          return;
        }
        fail(
          "Mất kết nối speech. Audio chưa xác nhận không được tự gửi lại; hãy kết nối và tra cứu trạng thái.",
          true,
        );
      };
      const open = async (): Promise<SpeechConnection> => {
        const ticket = await speechApi.ticket(attemptId, abort.signal);
        if (id !== generation.current || abort.signal.aborted)
          throw new Error("Kết nối đã hủy.");
        return connectSpeech(ticket.ticket, onEvent, onLost, abort.signal);
      };
      const connection = await open();
      if (id !== generation.current || abort.signal.aborted) {
        connection.close();
        return;
      }
      socket.current = connection;
      dispatch({ type: "READY", question });
    } catch (error) {
      if (id === generation.current && !abort.signal.aborted)
        fail(
          error instanceof Error ? error.message : "Không thể kết nối speech.",
        );
    }
  }, [
    active,
    attemptId,
    dispatch,
    fail,
    handleEvent,
    key,
    lookup,
    release,
    turnId,
    getPhase,
  ]);

  const speak = async () => {
    if (getPhase() !== "ready" || !current.current.question) return;
    const abort = new AbortController();
    tts.current = abort;
    dispatch({ type: "SPEAK" });
    try {
      await speakVietnamese(
        current.current.question.text,
        current.current.question.language,
        abort.signal,
      );
      if (!abort.signal.aborted) dispatch({ type: "SPOKEN" });
    } catch (error) {
      if (!abort.signal.aborted)
        dispatch({
          type: "SPOKEN",
          message:
            error instanceof Error ? error.message : "Không thể đọc câu hỏi.",
        });
    }
  };
  const start = async () => {
    if (!active || getPhase() !== "ready" || pending.current) return;
    // The idle socket may be mid-reconnect; rebuild it first instead of ignoring the click.
    if (!socket.current) await connect();
    if (
      getPhase() !== "ready" ||
      pending.current ||
      !socket.current ||
      !controller.current
    )
      return;
    const id = generation.current;
    dispatch({ type: "START" });
    try {
      const mic = await preparePcmCapture(
        (value) => socket.current!.audio(value),
        fail,
        controller.current.signal,
        (lvl) => setAudioLevel(lvl),
      );
      if (id !== generation.current || getPhase() !== "starting") {
        mic.cancel();
        return;
      }
      capture.current = mic;
      serverFinalizing.current = false;
      startRequest.current = crypto.randomUUID();
      endRequest.current = null;
      socket.current.command({
        type: "answer.start",
        requestId: startRequest.current,
        questionTurnId: turnId,
        audio: { encoding: "PCM_S16LE", sampleRate: 16000, channels: 1 },
      });
      timer.current = setTimeout(
        () =>
          fail(
            "Chưa nhận được xác nhận bắt đầu thu âm. Đã dừng kết nối; vui lòng thử lại.",
          ),
        60_000,
      );
    } catch (error) {
      if (id === generation.current)
        fail(
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Bạn chưa cấp quyền micro. Hãy cho phép micro trong trình duyệt rồi thử lại."
            : error instanceof DOMException && error.name === "NotFoundError"
              ? "Không tìm thấy micro. Hãy kết nối thiết bị rồi thử lại."
              : error instanceof Error
                ? error.message
                : "Không truy cập được micro.",
        );
    }
  };
  const stop = useCallback(async () => {
    if (getPhase() !== "recording" || !pending.current) return;
    setAudioLevel(0);
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    recognitionRef.current = null;
    dispatch({ type: "FINALIZING" });
    const id = generation.current;
    try {
      await capture.current?.finish();
      capture.current = null;
      if (
        id !== generation.current ||
        getPhase() === "saved" ||
        serverFinalizing.current
      )
        return;
      // If the server already finalized on its deadline, do not send a second command.
      if (!socket.current) return;
      endRequest.current = crypto.randomUUID();
      socket.current.command({
        type: "answer.end",
        requestId: endRequest.current,
        answerId: pending.current,
      });
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => fail("Chưa nhận xác nhận lưu. Vui lòng tra cứu câu trả lời."),
        60_000,
      );
    } catch (error) {
      if (
        id === generation.current &&
        getPhase() !== "saved" &&
        !serverFinalizing.current
      )
        fail(
          error instanceof Error
            ? error.message
            : "Không thể xác nhận câu trả lời.",
        );
    }
  }, [dispatch, fail, getPhase]);

  useEffect(() => {
    if (!active && !["idle", "saved"].includes(getPhase()))
      fail(
        "Lượt thi không còn hoạt động. Hãy kiểm tra trạng thái với giảng viên.",
      );
  }, [active, fail, getPhase]);

  useEffect(() => {
    const offline = () =>
      fail(
        "Mất kết nối mạng. Đã dừng thu âm; hãy kết nối lại để tra cứu kết quả lưu.",
        true,
      );
    window.addEventListener("offline", offline);
    return () => {
      dispose();
      window.removeEventListener("offline", offline);
    };
  }, [fail, dispose]);

  const previousTurnId = useRef(turnId);
  useEffect(() => {
    if (previousTurnId.current === turnId) return;
    previousTurnId.current = turnId;

    // Reset turn-specific state
    pending.current = null;
    startRequest.current = null;
    endRequest.current = null;
    serverFinalizing.current = false;
    clearTimeout(timer.current);

    // If socket is already open and ready, smoothly transition to the new turn
    if (socket.current && active) {
      const abort = new AbortController();
      controller.current = abort;
      void (async () => {
        try {
          const question = await speechApi.playback(attemptId, turnId, abort.signal);
          if (!abort.signal.aborted) {
            dispatch({ type: "RESET_TURN", question });
          }
        } catch (error) {
          if (!abort.signal.aborted) {
            fail(error instanceof Error ? error.message : "Không thể tải câu hỏi tiếp theo.");
          }
        }
      })();
    } else {
      dispatch({ type: "RESET_TURN" });
    }
  }, [attemptId, turnId, active, dispatch, fail]);

  const clearStaleAnswer = useCallback(() => {
    pending.current = null;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
    dispatch({ type: "CLEAR_STALE_ANSWER" });
  }, [key, dispatch]);

  const restartAnswer = useCallback(async () => {
    if (!active) return;
    clearTimeout(timer.current);
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    recognitionRef.current = null;
    setClientDraft("");
    capture.current?.cancel();
    capture.current = null;
    serverFinalizing.current = false;
    startRequest.current = null;
    endRequest.current = null;
    pending.current = null;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }

    controller.current?.abort();
    socket.current?.close();
    socket.current = null;

    const question = current.current.question;
    dispatch({ type: "RESET_TURN", question: question ?? undefined });

    await connect();
  }, [active, connect, dispatch, key]);

  return { state, clientDraft, audioLevel, connect, speak, start, stop, clearStaleAnswer, restartAnswer };
}
