import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rubricRepository } from './rubric-repository'
import type { RubricDraft } from './rubric-types'
import { runtimeConfig } from '../../services/api/runtime-config'
import { isUuid } from '../question-bank/api-question-repository'
import { apiQuestionKeys, questionKeys } from '../question-bank/question-hooks'

export const rubricKeys = { all: ['rubrics'] as const, global: ['rubrics', 'global'] as const, list: (subjectId: string) => [...rubricKeys.all, subjectId] as const, detail: (subjectId: string, rubricId: string) => [...rubricKeys.list(subjectId), rubricId] as const, globalDetail: (rubricId: string) => [...rubricKeys.global, rubricId] as const }
export function useRubrics(subjectId: string) { return useQuery({ queryKey: rubricKeys.list(subjectId), queryFn: () => rubricRepository.list(subjectId), enabled: Boolean(subjectId) && (runtimeConfig.dataSource === 'mock' || isUuid(subjectId)) }) }
export function useRubric(subjectId: string, rubricId: string | undefined) { return useQuery({ queryKey: rubricKeys.detail(subjectId, rubricId ?? ''), queryFn: () => rubricRepository.get(subjectId, rubricId ?? ''), enabled: Boolean(subjectId && rubricId) }) }
export function useGlobalRubrics() { return useQuery({ queryKey: rubricKeys.global, queryFn: () => rubricRepository.list('') }) }
export function useGlobalRubric(rubricId: string | undefined) { return useQuery({ queryKey: rubricKeys.globalDetail(rubricId ?? ''), queryFn: () => rubricRepository.get('', rubricId ?? ''), enabled: Boolean(rubricId) }) }
export function useSaveRubric() { const client = useQueryClient(); return useMutation({ mutationFn: (draft: RubricDraft & { id?: string }) => rubricRepository.save(draft), onSuccess: (rubric) => client.invalidateQueries({ queryKey: rubricKeys.list(rubric.subjectId) }) }) }
export function useSaveGlobalRubric() { const client = useQueryClient(); return useMutation({ mutationFn: (draft: RubricDraft & { id?: string }) => rubricRepository.save({ ...draft, subjectId: '' }), onSuccess: () => { client.invalidateQueries({ queryKey: rubricKeys.global }); client.invalidateQueries({ queryKey: rubricKeys.all }) } }) }
export function useDeleteRubric() { const client = useQueryClient(); return useMutation({ mutationFn: (rubricId: string) => rubricRepository.delete(rubricId), onSuccess: (_result, rubricId) => { client.removeQueries({ queryKey: rubricKeys.all }); client.invalidateQueries({ queryKey: rubricKeys.all }); client.removeQueries({ queryKey: [...questionKeys.all, rubricId] }); client.invalidateQueries({ queryKey: questionKeys.all }); client.invalidateQueries({ queryKey: apiQuestionKeys.all }) } }) }
