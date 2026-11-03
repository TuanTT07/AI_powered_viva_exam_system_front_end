import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { StudentPortalView } from './views/StudentPortalView'
import { examSeed } from './exam-repository'
import { StudentSchedulePortal } from './StudentSchedulePortal'

export function StudentExamListPage() {
  const { session } = useSession()
  return runtimeConfig.dataSource === 'api' ? <StudentSchedulePortal list /> : <StudentPortalView list name={session.user?.displayName ?? 'Sinh viên'} apiMode={false} exams={examSeed} />
}
