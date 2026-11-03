import { useSession } from '../../../app/providers/use-session'
import { runtimeConfig } from '../../../services/api/runtime-config'
import { StudentPortalView } from '../../exams/views/StudentPortalView'
import { examSeed } from '../../exams/exam-repository'
import { StudentSchedulePortal } from '../../exams/StudentSchedulePortal'

export function StudentDashboard() {
  const { session } = useSession()
  return runtimeConfig.dataSource === 'api' ? <StudentSchedulePortal /> : <StudentPortalView name={session.user?.displayName ?? 'Sinh viên'} apiMode={false} exams={examSeed.slice(0, 4)} />
}
