import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { questionRepository } from './question-repository'
import type { ImportedQuestionDraft } from './question-types'

export const questionKeys = { all: ['question-bank'] as const, list: (subjectId: string) => [...questionKeys.all, subjectId] as const, detail: (subjectId: string, questionId: string) => [...questionKeys.list(subjectId), questionId] as const }
export function useQuestions(subjectId: string) { return useQuery({ queryKey: questionKeys.list(subjectId), queryFn: () => questionRepository.list(subjectId), enabled: Boolean(subjectId) }) }
export function useQuestion(subjectId: string, questionId: string | undefined) { return useQuery({ queryKey: questionKeys.detail(subjectId, questionId ?? ''), queryFn: () => questionRepository.get(subjectId, questionId ?? ''), enabled: Boolean(subjectId && questionId) }) }
export function useQuestionTopics(subjectId: string) { return useQuery({ queryKey: [...questionKeys.list(subjectId), 'topics'], queryFn: () => questionRepository.topics(subjectId), enabled: Boolean(subjectId) }) }
export function useImportQuestions() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, drafts }: { subjectId: string; drafts: ImportedQuestionDraft[] }) => questionRepository.import(subjectId, drafts), onSuccess: (_result, variables) => client.invalidateQueries({ queryKey: questionKeys.list(variables.subjectId) }) }) }
export function useSaveQuestion() { const client = useQueryClient(); return useMutation({ mutationFn: questionRepository.save, onSuccess: (question) => client.invalidateQueries({ queryKey: questionKeys.list(question.subjectId) }) }) }
