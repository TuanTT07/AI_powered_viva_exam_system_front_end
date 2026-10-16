import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { StudentPortalView } from './views/StudentPortalView'
import { examSeed } from './exam-repository'

export function StudentExamListPage() {
  const { session } = useSession()
  return <StudentPortalView list name={session.user?.displayName ?? 'Sinh viên'} apiMode={runtimeConfig.dataSource === 'api'} exams={runtimeConfig.dataSource === 'mock' ? examSeed : undefined} />
}
