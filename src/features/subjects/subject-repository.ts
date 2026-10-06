import { runtimeConfig } from '../../services/api/runtime-config'
import type { LecturerSubject } from './subject-types'

const seed: Omit<LecturerSubject, 'id' | 'source'>[] = [
  { code: 'INT2204', name: 'Lập trình Java', department: 'Khoa Công nghệ thông tin', status: 'ACTIVE', questionCount: 24, draftQuestionCount: 6, approvedQuestionCount: 18, rubricCount: 4, materialCount: 8, examCount: 3 },
  { code: 'INT2201', name: 'Java Core', department: 'Khoa Công nghệ thông tin', status: 'ACTIVE', questionCount: 18, draftQuestionCount: 3, approvedQuestionCount: 15, rubricCount: 3, materialCount: 5, examCount: 2 },
  { code: 'INT2210', name: 'Cơ sở dữ liệu', department: 'Khoa Hệ thống thông tin', status: 'ACTIVE', questionCount: 21, draftQuestionCount: 4, approvedQuestionCount: 17, rubricCount: 5, materialCount: 6, examCount: 2 },
  { code: 'INT2220', name: 'Hệ điều hành', department: 'Khoa Công nghệ thông tin', status: 'ARCHIVED', questionCount: 12, draftQuestionCount: 0, approvedQuestionCount: 12, rubricCount: 2, materialCount: 3, examCount: 1 },
]

export type SubjectRepository = { list(): Promise<LecturerSubject[]>; get(id: string): Promise<LecturerSubject | undefined> }
export function createMockSubjectRepository(config = runtimeConfig): SubjectRepository {
  return {
    async list() { return seed.map((subject, index) => ({ ...subject, id: index === 0 && config.dataSource === 'api' && config.demoCourseId ? config.demoCourseId : ['oop-java', 'java-core', 'database', 'operating-systems'][index], source: 'mock' as const })) },
    async get(id) { return (await this.list()).find((subject) => subject.id === id) },
  }
}
export const subjectRepository = createMockSubjectRepository()
