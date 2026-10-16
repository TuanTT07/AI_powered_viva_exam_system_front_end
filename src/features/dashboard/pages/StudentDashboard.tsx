import { useSession } from '../../../app/providers/use-session'
import { runtimeConfig } from '../../../services/api/runtime-config'
import { StudentPortalView } from '../../exams/views/StudentPortalView'
import { examSeed } from '../../exams/exam-repository'

export function StudentDashboard() {
  const { session } = useSession()
  return <StudentPortalView name={session.user?.displayName ?? 'Sinh viên'} apiMode={runtimeConfig.dataSource === 'api'} exams={runtimeConfig.dataSource === 'mock' ? examSeed.slice(0, 4) : undefined} />
}
