import type { AnswerReceipt, QuestionPlayback } from "./speech-api";
export type SpeechPhase =
  | "idle"
  | "connecting"
  | "ready"
  | "speaking"
  | "starting"
  | "recording"
  | "finalizing"
  | "checking"
  | "saved"
  | "disconnected"
  | "error";
type Segment = { revision: number; text: string; final: boolean };
export type SpeechState = {
  phase: SpeechPhase;
  question: QuestionPlayback | null;
  answerId: string | null;
  deadline: string | null;
  segments: Record<string, Segment>;
  receipt: AnswerReceipt | null;
  error: string | null;
};
export const initialSpeechState: SpeechState = {
  phase: "idle",
  question: null,
  answerId: null,
  deadline: null,
  segments: {},
  receipt: null,
  error: null,
};
export type SpeechAction =
  | { type: "CONNECT" }
  | { type: "READY"; question: QuestionPlayback }
  | { type: "SPEAK" }
  | { type: "SPOKEN"; message?: string }
  | { type: "START" }
  | { type: "STARTED"; answerId: string; deadline: string }
  | {
      type: "SEGMENT";
      answerId: string;
      segmentId: string;
      revision: number;
      text: string;
      final: boolean;
    }
  | { type: "FINALIZING" }
  | { type: "CHECK"; answerId: string }
  | { type: "SAVED"; answerId: string; receipt: AnswerReceipt }
  | {
      type: "ERROR";
      message: string;
      disconnected?: boolean;
      clearAnswer?: boolean;
    }
  | { type: "RESET_TURN"; question?: QuestionPlayback }
  | { type: "CLEAR_STALE_ANSWER" };
export function speechReducer(
  state: SpeechState,
  action: SpeechAction,
): SpeechState {
  switch (action.type) {
    case "CONNECT":
      return { ...state, phase: "connecting", error: null };
    case "READY":
      return {
        ...state,
        phase: "ready",
        question: action.question,
        error: null,
      };
    case "SPEAK":
      return state.phase === "ready"
        ? { ...state, phase: "speaking", error: null }
        : state;
    case "SPOKEN":
      return state.phase === "speaking"
        ? { ...state, phase: "ready", error: action.message ?? null }
        : state;
    case "START":
      return state.phase === "ready" && !state.answerId
        ? {
            ...state,
            phase: "starting",
            segments: {},
            deadline: null,
            error: null,
          }
        : state;
    case "STARTED":
      return state.phase === "starting"
        ? {
            ...state,
            phase: "recording",
            answerId: action.answerId,
            deadline: action.deadline,
          }
        : state;
    case "SEGMENT": {
      if (
        state.answerId !== action.answerId ||
        !["recording", "finalizing"].includes(state.phase)
      )
        return state;
      const old = state.segments[action.segmentId];
      if (old && (old.revision >= action.revision || old.final)) return state;
      return {
        ...state,
        segments: {
          ...state.segments,
          [action.segmentId]: {
            revision: action.revision,
            text: action.text,
            final: action.final,
          },
        },
      };
    }
    case "FINALIZING":
      return ["recording", "finalizing"].includes(state.phase)
        ? { ...state, phase: "finalizing" }
        : state;
    case "CHECK":
      return {
        ...state,
        phase: "checking",
        answerId: action.answerId,
        error: null,
      };
    case "SAVED":
      return state.answerId === action.answerId
        ? {
            ...state,
            phase: "saved",
            receipt: action.receipt,
            segments: {},
            deadline: null,
            error: null,
          }
        : state;
    case "ERROR":
      return state.phase === "saved"
        ? state
        : {
            ...state,
            phase: action.disconnected ? "disconnected" : "error",
            error: action.message,
            ...(action.clearAnswer
              ? { answerId: null, deadline: null, segments: {} }
              : {}),
          };
    case "RESET_TURN":
      return {
        ...state,
        phase: action.question ? "ready" : "idle",
        question: action.question ?? state.question,
        answerId: null,
        deadline: null,
        segments: {},
        receipt: null,
        error: null,
      };
    case "CLEAR_STALE_ANSWER":
      return {
        ...state,
        phase: "idle",
        answerId: null,
        deadline: null,
        segments: {},
        receipt: null,
        error: null,
      };
  }
}
export function speechDraft(state: SpeechState): string {
  return Object.entries(state.segments)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, segment]) => segment.text)
    .join(" ")
    .trim();
}
