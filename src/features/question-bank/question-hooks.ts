import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { questionRepository } from './question-repository'
import type { ImportedQuestionDraft } from './question-types'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiQuestionRepository, isUuid, type QuestionSearchParams, type QuestionWriteInput } from './api-question-repository'

export const questionKeys = { all: ['question-bank'] as const, list: (subjectId: string) => [...questionKeys.all, subjectId] as const, detail: (subjectId: string, questionId: string) => [...questionKeys.list(subjectId), questionId] as const }
export const apiQuestionKeys = { all: [...questionKeys.all, 'api'] as const, list: (params: QuestionSearchParams) => [...apiQuestionKeys.all, params] as const, detail: (subjectId: string, questionId: string) => [...apiQuestionKeys.all, subjectId, questionId] as const }
export function useQuestions(subjectId: string) { return useQuery({ queryKey: questionKeys.list(subjectId), queryFn: () => questionRepository.list(subjectId), enabled: Boolean(subjectId) }) }
export function useQuestion(subjectId: string, questionId: string | undefined) { return useQuery({ queryKey: questionKeys.detail(subjectId, questionId ?? ''), queryFn: () => questionRepository.get(subjectId, questionId ?? ''), enabled: Boolean(subjectId && questionId) }) }
export function useQuestionTopics(subjectId: string) { return useQuery({ queryKey: [...questionKeys.list(subjectId), 'topics'], queryFn: () => questionRepository.topics(subjectId), enabled: Boolean(subjectId) }) }
export function useImportQuestions() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, drafts }: { subjectId: string; drafts: ImportedQuestionDraft[] }) => questionRepository.import(subjectId, drafts), onSuccess: (_result, variables) => client.invalidateQueries({ queryKey: questionKeys.list(variables.subjectId) }) }) }
export function useSaveQuestion() { const client = useQueryClient(); return useMutation({ mutationFn: questionRepository.save, onSuccess: (question) => client.invalidateQueries({ queryKey: questionKeys.list(question.subjectId) }) }) }
export function useApiQuestions(params: QuestionSearchParams) { return useQuery({ queryKey: apiQuestionKeys.list(params), queryFn: () => apiQuestionRepository.search(params), enabled: runtimeConfig.dataSource === 'api' && Boolean(params.courseId) }) }
export function useApiQuestion(subjectId: string, questionId: string | undefined) { return useQuery({ queryKey: apiQuestionKeys.detail(subjectId, questionId ?? ''), queryFn: () => apiQuestionRepository.get(subjectId, questionId ?? ''), enabled: runtimeConfig.dataSource === 'api' && isUuid(subjectId) && Boolean(questionId) }) }
function invalidateApiCourse(client: ReturnType<typeof useQueryClient>, courseId: string) {
  client.invalidateQueries({ queryKey: apiQuestionKeys.all, predicate: (query) => {
    const params = query.queryKey[2]
    return typeof params === 'object' && params !== null && 'courseId' in params && params.courseId === courseId
  } })
}
export function useCreateApiQuestion() { const client = useQueryClient(); return useMutation({ mutationFn: (input: QuestionWriteInput) => apiQuestionRepository.create(input), onSuccess: (question) => invalidateApiCourse(client, question.subjectId) }) }
export function useUpdateApiQuestion() { const client = useQueryClient(); return useMutation({ mutationFn: ({ questionId, input }: { questionId: string; input: QuestionWriteInput }) => apiQuestionRepository.update(questionId, input), onSuccess: (question, variables) => { client.setQueryData(apiQuestionKeys.detail(question.subjectId, variables.questionId), question); invalidateApiCourse(client, question.subjectId) } }) }
export function useApproveApiQuestion() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, questionId }: { subjectId: string; questionId: string }) => apiQuestionRepository.approve(subjectId, questionId), onSuccess: (question, variables) => { client.setQueryData(apiQuestionKeys.detail(variables.subjectId, variables.questionId), question); invalidateApiCourse(client, variables.subjectId) } }) }
export function useDeleteApiQuestion() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, questionId }: { subjectId: string; questionId: string }) => apiQuestionRepository.delete(subjectId, questionId), onSuccess: (_result, variables) => { client.removeQueries({ queryKey: apiQuestionKeys.detail(variables.subjectId, variables.questionId) }); invalidateApiCourse(client, variables.subjectId) } }) }
