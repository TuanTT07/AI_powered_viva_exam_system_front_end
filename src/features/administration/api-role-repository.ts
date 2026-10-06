import { apiClient } from '../../services/api/client'

export type AdminRole = { id: string; roleName: string; description: string }
type ApiResponse<T> = { success: boolean; status: number; message: string; data: T }

export const apiRoleRepository = {
  async list(): Promise<AdminRole[]> {
    const response = await apiClient.request<ApiResponse<AdminRole[]>>('/api/admin/roles')
    if (!response.success) throw new Error(response.message || 'Lỗi lấy danh sách vai trò')
    return response.data
  },
}
