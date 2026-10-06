export const examRoutes = {
  list: '/lecturer/exams',
  detail: (examId: string) => `/lecturer/exams/${examId}`,
  edit: (examId: string) => `/lecturer/exams/${examId}/edit`,
  students: (examId: string) => `/lecturer/exams/${examId}/students`,
  schedule: (examId: string) => `/lecturer/exams/${examId}/schedule`,
}
