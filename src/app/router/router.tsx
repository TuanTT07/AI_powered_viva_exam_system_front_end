import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth, RequireRole } from '../guards/guards'
import { AdminLayout, AuthLayout, ExamLayout, LecturerLayout, StudentLayout } from '../layouts/layouts'
import { LoginPage, NotFound, Placeholder, RouteError } from '../../pages/pages'
import { UserManagementPage } from '../../features/administration/pages/UserManagementPage'
import { SubjectManagementPage } from '../../features/administration/pages/SubjectManagementPage'
import { SettingsPage } from '../../features/administration/pages/SettingsPage'
import { AdminDashboardPage } from '../../features/administration/pages/AdminDashboardPage'
import type { AppRole } from '../../types/auth'
import { QuestionBankPage } from '../../features/question-bank/question-bank-page'
import { QuestionEditorPage } from '../../features/question-bank/question-editor-page'
import { RubricEditorPage, RubricListPage } from '../../features/rubrics/rubric-pages'
import { CourseMaterialsPage } from '../../features/learning-materials/course-materials-page'
import { VivaInterviewRoom } from '../../features/viva-session/pages/VivaInterviewRoom'
import { ExamSuccessPage } from '../../features/viva-session/pages/ExamSuccessPage'
import { AIQuestionGenerationPage } from '../../features/ai-question-generation/ai-question-generation-page'
import { ExamListPage } from '../../features/exams/exam-list-page'
import { ExamEditorPage } from '../../features/exams/exam-editor'
import { ExamStudentRosterPage } from '../../features/exams/exam-student-roster-page'

type RouteInfo = [string, string, string, string]
const lecturer: RouteInfo[] = [
  ['', 'Tổng quan giảng viên', 'Dashboard', 'Không gian điều phối học phần và kỳ thi.'], ['subjects', 'Môn học phụ trách', 'Subjects', 'Danh sách môn học được backend phân công.'], ['subjects/:subjectId', 'Tổng quan môn học', 'Subjects', 'Bối cảnh học phần và tác vụ được cấp quyền.'], ['subjects/:subjectId/materials', 'Học liệu', 'Learning Materials', 'Quản lý trạng thái tài liệu và nguồn tri thức AI.'], ['subjects/:subjectId/questions', 'Ngân hàng câu hỏi', 'Question Bank', 'Quản lý câu hỏi đã được giảng viên xét duyệt.'], ['subjects/:subjectId/questions/generate', 'Sinh câu hỏi AI', 'Question Bank', 'Rà soát câu hỏi nháp trước khi phê duyệt.'], ['subjects/:subjectId/questions/new', 'Tạo câu hỏi', 'Question Bank', 'Soạn câu hỏi mới và liên kết rubric.'], ['subjects/:subjectId/questions/:questionId', 'Chỉnh sửa câu hỏi', 'Question Bank', 'Cập nhật câu hỏi theo quyền backend.'], ['subjects/:subjectId/rubrics', 'Rubrics', 'Rubrics', 'Danh sách rubric của học phần.'], ['subjects/:subjectId/rubrics/new', 'Tạo rubric', 'Rubrics', 'Tạo rubric và thang điểm.'], ['subjects/:subjectId/rubrics/:rubricId', 'Chỉnh sửa rubric', 'Rubrics', 'Cập nhật tiêu chí và score band.'], ['exams', 'Kỳ thi vấn đáp', 'Exams', 'Danh sách kỳ thi do giảng viên phụ trách.'], ['exams/new', 'Tạo kỳ thi', 'Exams', 'Thiết lập kỳ thi theo hợp đồng backend.'], ['exams/:examId', 'Tổng quan kỳ thi', 'Exams', 'Trạng thái và khả năng thao tác của kỳ thi.'], ['exams/:examId/edit', 'Cấu hình kỳ thi', 'Exams', 'Cấu hình lịch, câu hỏi và giới hạn.'], ['exams/:examId/students', 'Phân công sinh viên', 'Exams', 'Quản lý danh sách sinh viên đủ điều kiện.'], ['exams/:examId/monitor', 'Theo dõi kỳ thi', 'Monitoring', 'Theo dõi trạng thái attempt đã xác thực.'], ['exams/:examId/attempts', 'Danh sách lượt thi', 'Grading', 'Hàng đợi review và chấm điểm.'], ['exams/:examId/attempts/:attemptId', 'Không gian chấm điểm', 'Grading', 'AI suggestion và điểm chính thức là các trạng thái tách biệt.'], ['exams/:examId/report', 'Báo cáo kỳ thi', 'Reports', 'Báo cáo và xuất dữ liệu theo quyền.'],
]
const student: RouteInfo[] = [['', 'Tổng quan sinh viên', 'Dashboard', 'Thông tin kỳ thi và kết quả được phép xem.'], ['exams', 'Kỳ thi của tôi', 'Exams', 'Các kỳ thi backend xác nhận đủ điều kiện.'], ['exams/:examId', 'Chi tiết kỳ thi', 'Exams', 'Hướng dẫn và điều kiện vào thi.'], ['exams/:examId/check', 'Kiểm tra thiết bị', 'Viva Session', 'Preflight cho micro, loa và mạng.'], ['exams/:examId/completed', 'Biên nhận nộp bài', 'Viva Session', 'Chỉ hiển thị sau xác nhận backend.'], ['results', 'Kết quả và biên bản', 'Results', 'Kết quả đã được công bố.'], ['exams/:examId/result', 'Kết quả kỳ thi', 'Results', 'Điểm chính thức theo chính sách công bố.']]
const admin: RouteInfo[] = [['', 'Tổng quan quản trị', 'Administration', 'Trạng thái vận hành được cho phép truy cập.'], ['users', 'Quản lý người dùng', 'Administration', 'Tài khoản, vai trò và trạng thái theo chính sách backend.'], ['subjects', 'Môn học và phân công', 'Administration', 'Quản lý subject và phạm vi giảng viên.'], ['settings', 'Cấu hình hệ thống', 'Administration', 'Chỉ hiển thị cấu hình backend công bố.']]
const pages = (role: AppRole, routes: RouteInfo[]) => routes.map(([path, title, feature, description]) => ({ path, element: <Placeholder role={role} title={title} feature={feature} description={description} /> }))

const adminRoutes = admin.map(([path, title, feature, description]) => {
  if (path === '') {
    return { index: true, element: <AdminDashboardPage /> }
  }
  if (path === 'users') {
    return { path, element: <UserManagementPage /> }
  }
  if (path === 'subjects') {
    return { path, element: <SubjectManagementPage /> }
  }
  if (path === 'settings') {
    return { path, element: <SettingsPage /> }
  }
  return { path, element: <Placeholder role="admin" title={title} feature={feature} description={description} /> }
})

const studentRoutes = student.map(([path, title, feature, description]) => {
  if (path === 'exams/:examId/completed') return { path, element: <ExamSuccessPage /> }
  return { path, element: <Placeholder role="student" title={title} feature={feature} description={description} /> }
})

export const router = createBrowserRouter([{
  path: '/', errorElement: <RouteError />, children: [
    { element: <AuthLayout />, children: [{ path: 'login', element: <LoginPage /> }] },
        {
      element: <RequireAuth />, children: [
        { element: <RequireRole roles={['lecturer']} />, children: [{ path: 'lecturer', element: <LecturerLayout />, children: [{ path: 'subjects/:subjectId/materials', element: <CourseMaterialsPage /> }, { path: 'subjects/:subjectId/questions/generate', element: <AIQuestionGenerationPage /> }, { path: 'subjects/:subjectId/questions', element: <QuestionBankPage /> }, { path: 'subjects/:subjectId/questions/new', element: <QuestionEditorPage /> }, { path: 'subjects/:subjectId/questions/:questionId', element: <QuestionEditorPage /> }, { path: 'subjects/:subjectId/rubrics', element: <RubricListPage /> }, { path: 'subjects/:subjectId/rubrics/new', element: <RubricEditorPage /> }, { path: 'subjects/:subjectId/rubrics/:rubricId', element: <RubricEditorPage /> }, { path: 'exams', element: <ExamListPage /> }, { path: 'exams/new', element: <ExamEditorPage /> }, { path: 'exams/:examId/students', element: <ExamStudentRosterPage /> }, { path: 'exams/:examId/edit', element: <ExamEditorPage /> }, ...pages('lecturer', lecturer.filter(([path]) => path !== 'exams' && path !== 'exams/new' && path !== 'exams/:examId/edit' && path !== 'exams/:examId/students'))] }] },
        { element: <RequireRole roles={['student']} />, children: [{ path: 'student', element: <StudentLayout />, children: studentRoutes }, { path: 'student/exams/:examId/session', element: <ExamLayout />, children: [{ index: true, element: <VivaInterviewRoom /> }] }] },
        { element: <RequireRole roles={['admin']} />, children: [{ path: 'admin', element: <AdminLayout />, children: adminRoutes }] },
      ]
    },
    { index: true, element: <Navigate replace to="/login" /> }, { path: '*', element: <NotFound /> },
  ]
}])
