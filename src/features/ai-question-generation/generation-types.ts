import type { BloomLevel, ImportedQuestionDraft } from '../question-bank/question-types'

export const generationLanguages = ['vi', 'en'] as const
export type GenerationLanguage = (typeof generationLanguages)[number]
export type GenerationRequest = { subjectId: string; materialIds: string[]; topic: string; bloom: BloomLevel; count: number; language: GenerationLanguage; rubricId?: string }
export type GeneratedQuestion = ImportedQuestionDraft & { id: string; sourceMaterialIds: string[]; sourceMaterialNames: string[]; selected: boolean; issues: string[] }
