import { describe, expect, it, vi } from 'vitest'
import { apiUserRepository } from './api-user-repository'
import { apiCourseRepository } from './api-course-repository'
import { apiRoleRepository } from './api-role-repository'
import { apiClient } from '../../services/api/client'

const id = '11111111-1111-4111-8111-111111111111'
const lecturerId = '22222222-2222-4222-8222-222222222222'
const envelope = <T,>(data: T) => ({ success: true, status: 200, message: 'ok', data })

describe('Admin API repositories', () => {
  it('calls user detail, reset password and courses endpoints', async () => {
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue(envelope({ id, userCode: 'CB-1', fullName: 'A', email: 'a@a.vn', roleName: 'LECTURER' }) as never)
    await apiUserRepository.getById(id)
    await apiUserRepository.resetPassword(id, 'secret123')
    request.mockResolvedValue(envelope([]) as never)
    await apiUserRepository.getCourses(id)
    expect(request.mock.calls.map(call => call[0])).toEqual([`/api/admin/users/${id}`, `/api/admin/users/${id}/password`, `/api/admin/users/${id}/courses`])
    expect(request.mock.calls[1][1]).toMatchObject({ method: 'PATCH', body: { newPassword: 'secret123' } })
    request.mockRestore()
  })
  it('rejects mock identifiers before admin API transport', async () => {
    const request = vi.spyOn(apiClient, 'request')
    await expect(apiUserRepository.getById('demo-user')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    await expect(apiCourseRepository.getById('oop-java')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
    request.mockRestore()
  })
  it('calls roles and course lecturer mutation endpoints', async () => {
    const request = vi.spyOn(apiClient, 'request').mockResolvedValueOnce(envelope([]) as never).mockResolvedValueOnce(envelope([]) as never).mockResolvedValueOnce(envelope({ id, courseCode: 'C', courseName: 'Course', department: 'D', lecturers: [] }) as never).mockResolvedValueOnce(envelope(undefined) as never).mockResolvedValueOnce(envelope(undefined) as never)
    await apiRoleRepository.list(); await apiCourseRepository.getLecturers(id); await apiCourseRepository.assignLecturer(id, lecturerId); await apiCourseRepository.removeLecturer(id, lecturerId); await apiCourseRepository.delete(id)
    expect(request.mock.calls.map(call => `${call[1]?.method || 'GET'} ${call[0]}`)).toEqual([
      'GET /api/admin/roles', `GET /api/admin/courses/${id}/lecturers`, `PUT /api/admin/courses/${id}/lecturers/${lecturerId}`, `DELETE /api/admin/courses/${id}/lecturers/${lecturerId}`, `DELETE /api/admin/courses/${id}`,
    ])
    request.mockRestore()
  })
  it('creates user successfully across different backend response shapes', async () => {
    const payload = { fullName: 'Nguyễn Văn Test', email: 'test@academia.edu.vn', roleName: 'LECTURER', userCode: 'CB-999', password: 'Password123!' }

    // Case 1: Standard envelope with UserResponseDto
    const request = vi.spyOn(apiClient, 'request').mockResolvedValueOnce(envelope({ id, userCode: 'CB-999', fullName: 'Nguyễn Văn Test', email: 'test@academia.edu.vn', roleName: 'LECTURER' }) as never)
    const res1 = await apiUserRepository.create(payload)
    expect(res1.name).toBe('Nguyễn Văn Test')
    expect(res1.identifier).toBe('CB-999')
    expect(res1.role).toBe('lecturer')

    // Case 2: Envelope with data=null (falls back to payload)
    request.mockResolvedValueOnce(envelope(null) as never)
    const res2 = await apiUserRepository.create(payload)
    expect(res2.name).toBe('Nguyễn Văn Test')
    expect(res2.identifier).toBe('CB-999')
    expect(res2.role).toBe('lecturer')

    // Case 3: Direct UserResponseDto without envelope
    request.mockResolvedValueOnce({ id, userCode: 'CB-999', fullName: 'Nguyễn Văn Test', email: 'test@academia.edu.vn', roleName: 'LECTURER' } as never)
    const res3 = await apiUserRepository.create(payload)
    expect(res3.name).toBe('Nguyễn Văn Test')
    expect(res3.identifier).toBe('CB-999')
    expect(res3.role).toBe('lecturer')

    // Case 4: Envelope with string ID
    request.mockResolvedValueOnce(envelope(id) as never)
    const res4 = await apiUserRepository.create(payload)
    expect(res4.id).toBe(id)
    expect(res4.name).toBe('Nguyễn Văn Test')

    // Case 5: Error response
    request.mockResolvedValueOnce({ success: false, status: 400, message: 'Mã cán bộ đã tồn tại' } as never)
    await expect(apiUserRepository.create(payload)).rejects.toThrow('Mã cán bộ đã tồn tại')

    request.mockRestore()
  })
})
