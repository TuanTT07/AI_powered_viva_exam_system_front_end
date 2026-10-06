import { useQuery } from '@tanstack/react-query'
import { examRepository } from './exam-repository'
import type { ExamListRequest } from './exam-types'

export const examKeys = { all: ['exams'] as const, list: (request: ExamListRequest) => [...examKeys.all, 'list', request] as const, subjects: () => [...examKeys.all, 'subjects'] as const, summary: () => [...examKeys.all, 'summary'] as const }
export function useExams(request: ExamListRequest) { return useQuery({ queryKey: examKeys.list(request), queryFn: () => examRepository.list(request) }) }
export function useExamSubjects() { return useQuery({ queryKey: examKeys.subjects(), queryFn: () => examRepository.subjects(), staleTime: Infinity }) }
export function useExamSummary() { return useQuery({ queryKey: examKeys.summary(), queryFn: () => examRepository.summary(), staleTime: Infinity }) }
