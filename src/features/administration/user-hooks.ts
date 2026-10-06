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
