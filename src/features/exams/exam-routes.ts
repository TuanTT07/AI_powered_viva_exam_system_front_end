export const examRoutes = {
  list: '/lecturer/exams',
  detail: (examId: string) => `/lecturer/exams/${examId}`,
  edit: (examId: string) => `/lecturer/exams/${examId}/edit`,
  students: (examId: string) => `/lecturer/exams/${examId}/students`,
  schedule: (examId: string) => `/lecturer/exams/${examId}/schedule`,
  questions: (examId: string) => `/lecturer/exams/${examId}/questions`,
  monitor: (examId: string) => `/lecturer/exams/${examId}/monitor`,
}
