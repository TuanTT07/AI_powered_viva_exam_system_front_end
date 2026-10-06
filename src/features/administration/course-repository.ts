import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'
import { apiCourseRepository, type Subject, type Page } from './api-course-repository'

const MOCK_SUBJECTS: Subject[] = [
  { id: '1', code: 'INT2204', name: 'Lập trình OOP', department: 'Khoa CNTT', lecturers: [{ id: 'l1', name: 'TS. Nguyễn Văn A', initials: 'VA' }, { id: 'l2', name: 'ThS. Trần B', initials: 'TB' }], questionCount: 450 },
  { id: '2', code: 'INT2208', name: 'Kiến trúc máy tính', department: 'Khoa CNTT', lecturers: [{ id: 'l3', name: 'PGS. Hoàng C', initials: 'HC' }], questionCount: 320 },
  { id: '3', code: 'MAT1092', name: 'Đại số tuyến tính', department: 'Khoa Toán Cơ', lecturers: [], questionCount: 0 },
  { id: '4', code: 'ECO101', name: 'Kinh tế vi mô', department: 'Khoa Kinh tế', lecturers: [{ id: 'l4', name: 'TS. Lê D', initials: 'LD' }], questionCount: 120 },
]

export const mockCourseRepository = {
  async search(params: { keyword?: string; page?: number; size?: number }): Promise<Page<Subject>> {
    let filtered = MOCK_SUBJECTS
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw) || s.department.toLowerCase().includes(kw))
    }
    
    return {
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      page: 1,
      size: filtered.length || 10
    }
  },

  async getById(id: string): Promise<Subject | null> {
    return MOCK_SUBJECTS.find(s => s.id === id) || null
  },
  
  async create(payload: { code: string; name: string; department: string }): Promise<Subject> {
    const newSubject: Subject = {
      id: Math.random().toString(),
      code: payload.code,
      name: payload.name,
      department: payload.department,
      lecturers: [],
      questionCount: 0,
    }
    MOCK_SUBJECTS.unshift(newSubject)
    return newSubject
  },

  async update(id: string, payload: { code: string; name: string; department: string }): Promise<Subject> {
    const index = MOCK_SUBJECTS.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Không tìm thấy môn học')
    const updated = { ...MOCK_SUBJECTS[index], ...payload }
    MOCK_SUBJECTS[index] = updated
    return updated
  }
}

export const courseRepository = selectRepository(runtimeConfig.dataSource, { mock: mockCourseRepository, api: apiCourseRepository })
