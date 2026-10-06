import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'
import { apiRoleRepository, type AdminRole } from './api-role-repository'

const MOCK_ROLES: AdminRole[] = [
  { id: 'role-admin', roleName: 'ADMIN', description: 'Quản trị toàn quyền' },
  { id: 'role-lecturer', roleName: 'LECTURER', description: 'Giảng viên và khảo thí' },
  { id: 'role-student', roleName: 'STUDENT', description: 'Thí sinh vấn đáp' },
]

export const mockRoleRepository = { async list() { return MOCK_ROLES } }
export const roleRepository = selectRepository(runtimeConfig.dataSource, { mock: mockRoleRepository, api: apiRoleRepository })
