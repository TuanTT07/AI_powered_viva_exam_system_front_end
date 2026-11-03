import { apiClient } from '../../services/api/client'

export type CourseStudent = { id: string; userCode: string; fullName: string; email: string }

export async function listCourseStudents(courseId: string, scope: 'admin' | 'lecturers') {
  const result = await apiClient.request<{ data: CourseStudent[] }>(
    `/api/${scope}/courses/${encodeURIComponent(courseId)}/students`,
  )
  return result.data
}

export async function updateCourseEnrollment(courseId: string, studentId: string, method: 'PUT' | 'DELETE') {
  await apiClient.request(
    `/api/admin/courses/${encodeURIComponent(courseId)}/students/${encodeURIComponent(studentId)}`,
    { method },
  )
}
