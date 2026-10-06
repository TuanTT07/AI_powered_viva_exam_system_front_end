import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseRepository } from './course-repository'

export function useCourses(params: { keyword?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseRepository.search(params),
  })
}

export function useCourse(id: string | null) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => id ? courseRepository.getById(id) : null,
    enabled: !!id,
  })
}

export function useSaveCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id?: string; code: string; name: string; department: string }) => {
      if (payload.id) {
        return courseRepository.update(payload.id, payload)
      }
      return courseRepository.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}
