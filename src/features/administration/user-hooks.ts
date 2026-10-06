import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userRepository } from './user-repository'

export function useUsers(params: { keyword?: string; role?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userRepository.search(params),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userRepository.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; fullName: string; email: string; roleName: string }) => 
      userRepository.update(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userRepository.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useUser(id: string | null) {
  return useQuery({ queryKey: ['users', 'detail', id], queryFn: () => id ? userRepository.getById(id) : null, enabled: !!id })
}

export function useUserCourses(id: string | null) {
  return useQuery({ queryKey: ['users', id, 'courses'], queryFn: () => id ? userRepository.getCourses(id) : [], enabled: !!id })
}

export function useResetUserPassword() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (payload: { id: string; newPassword: string }) => userRepository.resetPassword(payload.id, payload.newPassword), onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.id] }) })
}
