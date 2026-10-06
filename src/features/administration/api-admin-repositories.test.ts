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
})
