import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'
import { apiUserRepository, type User, type Page, type UserCourse } from './api-user-repository'

const MOCK_USERS: User[] = [
  { id: '1', name: 'TS. Nguyễn Văn An', identifier: 'CB-201402', email: 'nguyenvanan@academia.edu.vn', role: 'lecturer', status: 'active', subjects: ['Lập trình Java Core', 'OOP'], initials: 'NA' },
  { id: '2', name: 'TS. Lê Quang Dũng', identifier: 'CB-201618', email: 'dung.lq@academia.edu.vn', role: 'lecturer', status: 'active', subjects: ['Cấu trúc dữ liệu & Giải thuật'], initials: 'LD' },
  { id: '3', name: 'Ban Quản trị Hệ thống', identifier: 'SYS-ROOT-01', email: 'admin.viva@academia.edu.vn', role: 'admin', status: 'active', initials: 'QT' },
  { id: '4', name: 'Trần Mai Linh', identifier: 'SV-21020485', email: 'linh.tm21020485@sv.academia.edu.vn', role: 'student', status: 'active', subjects: ['K66-CAC'], initials: 'TL' },
  { id: '5', name: 'Cán bộ Hoàng Văn Tuấn', identifier: 'CB-201209', email: 'tuan.hv@academia.edu.vn', role: 'lecturer', status: 'inactive', subjects: ['Kiến trúc máy tính'], initials: 'HT' },
]

export const mockUserRepository = {
  async search(params: { keyword?: string; role?: string; page?: number; size?: number }): Promise<Page<User>> {
    let filtered = MOCK_USERS
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw) || u.identifier.toLowerCase().includes(kw))
    }
    if (params.role && params.role !== 'all') {
      filtered = filtered.filter((u) => u.role === params.role)
    }
    
    return {
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      page: 1,
      size: filtered.length || 10
    }
  },
  
  async create(payload: { fullName: string; email: string; roleName: string; userCode: string; password?: string }): Promise<User> {
    const roleStr = payload.roleName.toLowerCase()
    const newUser: User = {
      id: Math.random().toString(),
      name: payload.fullName,
      email: payload.email,
      identifier: payload.userCode,
      role: roleStr === 'admin' ? 'admin' : roleStr === 'student' ? 'student' : 'lecturer',
      status: 'active',
      initials: payload.fullName.substring(0, 2).toUpperCase()
    }
    MOCK_USERS.unshift(newUser)
    return newUser
  },

  async update(id: string, payload: { fullName: string; email: string; roleName: string }): Promise<User> {
    const index = MOCK_USERS.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Không tìm thấy người dùng')
    const roleStr = payload.roleName.toLowerCase()
    const updatedUser = { 
      ...MOCK_USERS[index], 
      name: payload.fullName, 
      email: payload.email,
      role: roleStr === 'admin' ? 'admin' as const : roleStr === 'student' ? 'student' as const : 'lecturer' as const
    }
    MOCK_USERS[index] = updatedUser
    return updatedUser
  },

  async delete(id: string): Promise<void> {
    const index = MOCK_USERS.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Không tìm thấy người dùng')
    MOCK_USERS.splice(index, 1)
  },
  async getById(id: string) { const user = MOCK_USERS.find(u => u.id === id); if (!user) throw new Error('Không tìm thấy người dùng'); return user },
  async resetPassword(id: string, _newPassword: string) { if (!MOCK_USERS.some(u => u.id === id)) throw new Error('Không tìm thấy người dùng') },
  async getCourses(id: string): Promise<UserCourse[]> { const user = MOCK_USERS.find(u => u.id === id); if (!user) throw new Error('Không tìm thấy người dùng'); return (user.subjects || []).map((name, index) => ({ id: `mock-course-${index}`, code: `MOCK-${index + 1}`, name, department: 'Khoa CNTT' })) },
}

export const userRepository = selectRepository(runtimeConfig.dataSource, { mock: mockUserRepository, api: apiUserRepository })
