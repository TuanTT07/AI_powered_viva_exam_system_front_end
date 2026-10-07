import { ApiError, apiClient } from '../../services/api/client'
import { isUuid } from '../question-bank/api-question-repository'

function assertCourseUuid(value: string) { if (!isUuid(value)) throw new ApiError('Mã môn học phải là UUID của backend.', { code: 'INVALID_UUID' }) }

export interface Subject {
  id: string
  code: string
  name: string
  department: string
  lecturers: { id: string; name: string; initials: string; userCode?: string; email?: string }[]
  questionCount: number
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

type LecturerResponseDto = {
  id: string
  userCode: string
  fullName: string
  email: string
}

type CourseResponseDto = {
  id: string
  courseCode: string
  courseName: string
  department: string
  createdAt?: string
}

type CourseDetailResponseDto = CourseResponseDto & {
  lecturers: LecturerResponseDto[]
}

type ApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

function getInitials(fullName: string): string {
  if (!fullName) return 'NA'
  const parts = fullName.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return fullName.substring(0, 2).toUpperCase()
}

function mapCourseDto(dto: CourseResponseDto): Subject {
  return {
    id: dto.id,
    code: dto.courseCode,
    name: dto.courseName,
    department: dto.department || 'Chưa phân bổ',
    lecturers: [], // Search list doesn't return lecturers, only details do
    questionCount: 0, // Backend doesn't provide this yet
  }
}

function mapCourseDetailDto(dto: CourseDetailResponseDto): Subject {
  return {
    ...mapCourseDto(dto),
    lecturers: (dto.lecturers || []).map((l) => ({
      id: l.id,
      name: l.fullName,
      initials: getInitials(l.fullName),
      userCode: l.userCode,
      email: l.email,
    })),
  }
}

export const apiCourseRepository = {
  async search(params: { keyword?: string; page?: number; size?: number }): Promise<Page<Subject>> {
    const query: Record<string, any> = {}
    if (params.keyword) query.keyword = params.keyword
    query.page = Math.max(0, (params.page ?? 1) - 1)
    query.size = params.size ?? 10

    // GET /api/admin/courses returns PageResponseCourseResponse
    const response = await apiClient.request<ApiResponse<Page<CourseResponseDto>>>('/api/admin/courses', { query })
    if (!response.success) throw new Error(response.message || 'Lỗi lấy danh sách môn học')
    
    const pageData = response.data
    return {
      content: pageData.content.map(mapCourseDto),
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      page: pageData.page + 1,
      size: pageData.size,
    }
  },

  async getById(id: string): Promise<Subject | null> {
    assertCourseUuid(id)
    const response = await apiClient.request<ApiResponse<CourseDetailResponseDto>>(`/api/admin/courses/${encodeURIComponent(id)}`)
    if (!response.success) throw new Error(response.message)
    return mapCourseDetailDto(response.data)
  },
  
  async create(payload: { code: string; name: string; department: string }): Promise<Subject> {
    const response = await apiClient.request<ApiResponse<CourseDetailResponseDto>>('/api/admin/courses', {
      method: 'POST',
      body: {
        courseCode: payload.code,
        courseName: payload.name,
        department: payload.department,
      },
    })
    if (!response.success) throw new Error(response.message || 'Lỗi tạo môn học')
    return mapCourseDetailDto(response.data)
  },

  async update(id: string, payload: { code: string; name: string; department: string }): Promise<Subject> {
    assertCourseUuid(id)
    const response = await apiClient.request<ApiResponse<CourseDetailResponseDto>>(`/api/admin/courses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: {
        courseCode: payload.code,
        courseName: payload.name,
        department: payload.department,
      },
    })
    if (!response.success) throw new Error(response.message || 'Lỗi cập nhật môn học')
    return mapCourseDetailDto(response.data)
  },

  async delete(id: string): Promise<void> {
    assertCourseUuid(id)
    const response = await apiClient.request<ApiResponse<void>>(`/api/admin/courses/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.success) throw new Error(response.message || 'Lỗi xóa môn học')
  },

  async getLecturers(courseId: string): Promise<Subject['lecturers']> {
    assertCourseUuid(courseId)
    const response = await apiClient.request<ApiResponse<LecturerResponseDto[]>>(`/api/admin/courses/${encodeURIComponent(courseId)}/lecturers`)
    if (!response.success) throw new Error(response.message || 'Lỗi lấy giảng viên phụ trách')
    return (response.data || []).map(l => ({ id: l.id, name: l.fullName, initials: getInitials(l.fullName), userCode: l.userCode, email: l.email }))
  },

  async assignLecturer(courseId: string, lecturerId: string): Promise<Subject> {
    assertCourseUuid(courseId); if (!isUuid(lecturerId)) throw new ApiError('Mã giảng viên phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<CourseDetailResponseDto>>(`/api/admin/courses/${encodeURIComponent(courseId)}/lecturers/${encodeURIComponent(lecturerId)}`, { method: 'PUT' })
    if (!response.success) throw new Error(response.message || 'Lỗi phân công giảng viên')
    return mapCourseDetailDto(response.data)
  },

  async removeLecturer(courseId: string, lecturerId: string): Promise<void> {
    assertCourseUuid(courseId); if (!isUuid(lecturerId)) throw new ApiError('Mã giảng viên phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<void>>(`/api/admin/courses/${encodeURIComponent(courseId)}/lecturers/${encodeURIComponent(lecturerId)}`, { method: 'DELETE' })
    if (!response.success) throw new Error(response.message || 'Lỗi gỡ giảng viên')
  }
}
