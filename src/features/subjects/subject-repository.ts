import { questionRepository } from '../question-bank/question-repository'
import { mockRubricRepository } from '../rubrics/rubric-repository'
import { mockMaterialRepository } from '../learning-materials/material-repository'
import { mockExamRepository } from '../exams/exam-repository'
import { runtimeConfig } from '../../services/api/runtime-config'
import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { unwrapApiEnvelope, type ApiEnvelope } from '../../services/api/transport-types'
import type { LecturerSubject } from './subject-types'

const seed: Omit<LecturerSubject, 'id' | 'source'>[] = [
  { code: 'INT2204', name: 'Lập trình Java', department: 'Khoa Công nghệ thông tin', status: 'ACTIVE', questionCount: 24, draftQuestionCount: 6, approvedQuestionCount: 18, rubricCount: 4, materialCount: 8, examCount: 3 },
  { code: 'INT2201', name: 'Java Core', department: 'Khoa Công nghệ thông tin', status: 'ACTIVE', questionCount: 18, draftQuestionCount: 3, approvedQuestionCount: 15, rubricCount: 3, materialCount: 5, examCount: 2 },
  { code: 'INT2210', name: 'Cơ sở dữ liệu', department: 'Khoa Hệ thống thông tin', status: 'ACTIVE', questionCount: 21, draftQuestionCount: 4, approvedQuestionCount: 17, rubricCount: 5, materialCount: 6, examCount: 2 },
  { code: 'INT2220', name: 'Hệ điều hành', department: 'Khoa Công nghệ thông tin', status: 'ARCHIVED', questionCount: 12, draftQuestionCount: 0, approvedQuestionCount: 12, rubricCount: 2, materialCount: 3, examCount: 1 },
]

export type SubjectRepository = { list(lecturerId?: string): Promise<LecturerSubject[]>; get(id: string, lecturerId?: string): Promise<LecturerSubject | undefined> }
export function createMockSubjectRepository(config = runtimeConfig): SubjectRepository {
  void config
  return {
    async list() {
      const exams = await mockExamRepository.list({ page: 1, pageSize: 100, q: '', subject: '', status: '' })
      return Promise.all(seed.map(async (subject, index) => {
        const id = ['oop-java', 'java-core', 'database', 'operating-systems'][index]
        const [questions, rubrics, materials] = await Promise.all([questionRepository.list(id), mockRubricRepository.list(id), mockMaterialRepository.list(id)])
        return { ...subject, id, source: 'mock' as const, questionCount: questions.length, draftQuestionCount: questions.filter(question => question.status === 'BẢN NHÁP').length, approvedQuestionCount: questions.filter(question => question.status === 'ĐÃ DUYỆT').length, rubricCount: rubrics.length, materialCount: materials.length, examCount: exams.items.filter(exam => exam.subjectId === id).length }
      }))
    },
    async get(id) { return (await this.list()).find((subject) => subject.id === id) },
  }
}

type CourseResponseDto = { id: string; courseCode: string; courseName: string; department: string; createdAt?: string }
type CourseResponseEnvelope = ApiEnvelope<CourseResponseDto[]>
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isLecturerUuid = (value: string) => uuidPattern.test(value)

export function mapCourseResponse(dto: CourseResponseDto): LecturerSubject {
  return { id: dto.id, code: dto.courseCode, name: dto.courseName, department: dto.department, status: 'ACTIVE', questionCount: null, draftQuestionCount: null, approvedQuestionCount: null, rubricCount: null, materialCount: null, examCount: null, source: 'api' }
}

export function createApiSubjectRepository(client: Pick<ApiClient, 'request'> = apiClient): SubjectRepository {
  const assertLecturerId = (lecturerId?: string) => {
    if (!lecturerId || !isLecturerUuid(lecturerId)) throw new ApiError('Mã giảng viên không hợp lệ.', { code: 'INVALID_UUID' })
    return lecturerId
  }
  return {
    async list(lecturerId) {
      const id = assertLecturerId(lecturerId)
      const response = await client.request<CourseResponseEnvelope>(`/api/lecturers/${encodeURIComponent(id)}/courses`)
      return (unwrapApiEnvelope(response) ?? []).map(mapCourseResponse)
    },
    async get(id, lecturerId) { return (await this.list(lecturerId)).find((subject) => subject.id === id) },
  }
}

export const mockSubjectRepository = createMockSubjectRepository()
export const apiSubjectRepository = createApiSubjectRepository()
export const subjectRepository = runtimeConfig.dataSource === 'api' ? apiSubjectRepository : mockSubjectRepository
