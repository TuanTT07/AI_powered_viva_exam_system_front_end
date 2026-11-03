import { useQuery } from '@tanstack/react-query'
import { useSession } from '../../app/providers/use-session'
import { subjectRepository } from './subject-repository'
import { runtimeConfig } from '../../services/api/runtime-config'
export const subjectKeys = { all: ['lecturer-subjects'] as const, list: (lecturerId: string) => [...subjectKeys.all, 'list', lecturerId] as const, detail: (lecturerId: string, id: string) => [...subjectKeys.all, 'detail', lecturerId, id] as const }
export function useLecturerSubjects() {
  const { session } = useSession()
  const lecturerId = session.user?.id ?? ''
  return useQuery({ queryKey: subjectKeys.list(lecturerId), queryFn: () => subjectRepository.list(lecturerId), enabled: runtimeConfig.dataSource === 'mock' || Boolean(session.user?.roles.includes('lecturer')), staleTime: 30_000 })
}
export function useLecturerSubject(id: string | undefined) {
  const { session } = useSession()
  const lecturerId = session.user?.id ?? ''
  return useQuery({ queryKey: subjectKeys.detail(lecturerId, id ?? ''), queryFn: async () => subjectRepository.get(id ?? '', lecturerId), enabled: Boolean(id) && (runtimeConfig.dataSource === 'mock' || Boolean(session.user?.roles.includes('lecturer'))) })
}
