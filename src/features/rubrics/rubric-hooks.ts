import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rubricRepository } from './rubric-repository'
import type { RubricDraft } from './rubric-types'

export const rubricKeys = { all: ['rubrics'] as const, list: (subjectId: string) => [...rubricKeys.all, subjectId] as const, detail: (subjectId: string, rubricId: string) => [...rubricKeys.list(subjectId), rubricId] as const }
export function useRubrics(subjectId: string) { return useQuery({ queryKey: rubricKeys.list(subjectId), queryFn: () => rubricRepository.list(subjectId), enabled: Boolean(subjectId) }) }
export function useRubric(subjectId: string, rubricId: string | undefined) { return useQuery({ queryKey: rubricKeys.detail(subjectId, rubricId ?? ''), queryFn: () => rubricRepository.get(subjectId, rubricId ?? ''), enabled: Boolean(subjectId && rubricId) }) }
export function useSaveRubric() { const client = useQueryClient(); return useMutation({ mutationFn: (draft: RubricDraft & { id?: string }) => rubricRepository.save(draft), onSuccess: (rubric) => client.invalidateQueries({ queryKey: rubricKeys.list(rubric.subjectId) }) }) }
