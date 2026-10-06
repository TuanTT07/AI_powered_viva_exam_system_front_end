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
