export type SubjectSource = 'api' | 'mock'
export type LecturerSubject = {
  id: string
  code: string
  name: string
  department: string
  status: 'ACTIVE' | 'ARCHIVED'
  questionCount: number | null
  draftQuestionCount: number | null
  approvedQuestionCount: number | null
  rubricCount: number | null
  materialCount: number | null
  examCount: number | null
  source: SubjectSource
}
