import { bloomLevels, type BloomLevel } from './question-types'

export type QuestionEditorDraft = { content: string; bloom: BloomLevel | ''; rubricId: string }
export type QuestionEditorReturnState = { returnTo: string; questionDraft: QuestionEditorDraft }

export function readQuestionEditorDraft(state: unknown): QuestionEditorDraft | undefined {
  if (!state || typeof state !== 'object' || !('questionDraft' in state)) return undefined
  const draft = state.questionDraft
  if (!draft || typeof draft !== 'object' || !('content' in draft) || !('bloom' in draft) || !('rubricId' in draft)) return undefined
  if (typeof draft.content !== 'string' || typeof draft.bloom !== 'string' || typeof draft.rubricId !== 'string') return undefined
  if (draft.bloom !== '' && !bloomLevels.includes(draft.bloom as BloomLevel)) return undefined
  return { content: draft.content, bloom: draft.bloom as BloomLevel | '', rubricId: draft.rubricId }
}
