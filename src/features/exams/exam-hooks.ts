import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { examRepository } from './exam-repository'
import type { ExamDraft, ExamListRequest } from './exam-types'

export const examKeys = { all: ['exams'] as const, lists: ['exams', 'list'] as const, list: (request: ExamListRequest) => [...examKeys.lists, request] as const, detail: (examId: string) => [...examKeys.all, 'detail', examId] as const, subjects: () => [...examKeys.all, 'subjects'] as const, summary: () => [...examKeys.all, 'summary'] as const }
export function useExams(request: ExamListRequest) { return useQuery({ queryKey: examKeys.list(request), queryFn: () => examRepository.list(request) }) }
export function useExam(examId: string | undefined) { return useQuery({ queryKey: examKeys.detail(examId ?? ''), queryFn: () => examRepository.get(examId ?? ''), enabled: Boolean(examId) }) }
export function useExamSubjects() { return useQuery({ queryKey: examKeys.subjects(), queryFn: () => examRepository.subjects(), staleTime: Infinity }) }
export function useExamSummary() { return useQuery({ queryKey: examKeys.summary(), queryFn: () => examRepository.summary(), staleTime: Infinity }) }
export function useCreateExam() { const client = useQueryClient(); return useMutation({ mutationFn: (draft: ExamDraft) => examRepository.create(draft), onSuccess: (exam) => { client.invalidateQueries({ queryKey: examKeys.lists }); client.invalidateQueries({ queryKey: examKeys.summary() }); client.setQueryData(examKeys.detail(exam.id), exam) } }) }
export function useUpdateExam() { const client = useQueryClient(); return useMutation({ mutationFn: ({ examId, draft }: { examId: string; draft: ExamDraft }) => examRepository.update(examId, draft), onSuccess: (exam) => { client.setQueryData(examKeys.detail(exam.id), exam); client.invalidateQueries({ queryKey: examKeys.lists }); client.invalidateQueries({ queryKey: examKeys.summary() }) } }) }
