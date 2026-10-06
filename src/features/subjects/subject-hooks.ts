import { useQuery } from '@tanstack/react-query'
import { subjectRepository } from './subject-repository'
export const subjectKeys = { all: ['lecturer-subjects'] as const, list: () => [...subjectKeys.all, 'list'] as const, detail: (id: string) => [...subjectKeys.all, 'detail', id] as const }
export function useLecturerSubjects() { return useQuery({ queryKey: subjectKeys.list(), queryFn: () => subjectRepository.list(), staleTime: 30_000 }) }
export function useLecturerSubject(id: string | undefined) { return useQuery({ queryKey: subjectKeys.detail(id ?? ''), queryFn: async () => subjectRepository.get(id ?? ''), enabled: Boolean(id) }) }
