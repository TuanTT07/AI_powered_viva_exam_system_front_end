import { useQuery } from '@tanstack/react-query'
import { useSession } from '../../app/providers/use-session'
import { subjectRepository } from './subject-repository'
export const subjectKeys = { all: ['lecturer-subjects'] as const, list: (lecturerId: string) => [...subjectKeys.all, 'list', lecturerId] as const, detail: (lecturerId: string, id: string) => [...subjectKeys.all, 'detail', lecturerId, id] as const }
export function useLecturerSubjects() {
  const { session } = useSession()
  const lecturerId = session.user?.id ?? ''
  return useQuery({ queryKey: subjectKeys.list(lecturerId), queryFn: () => subjectRepository.list(lecturerId), enabled: Boolean(session.user), staleTime: 30_000 })
}
export function useLecturerSubject(id: string | undefined) {
  const { session } = useSession()
  const lecturerId = session.user?.id ?? ''
  return useQuery({ queryKey: subjectKeys.detail(lecturerId, id ?? ''), queryFn: async () => subjectRepository.get(id ?? '', lecturerId), enabled: Boolean(id && session.user) })
}
