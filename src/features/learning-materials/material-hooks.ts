import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { materialRepository } from './material-repository'

export const materialKeys = { all: ['course-materials'] as const, list: (subjectId: string) => [...materialKeys.all, subjectId] as const }
export function useMaterials(subjectId: string) { return useQuery({ queryKey: materialKeys.list(subjectId), queryFn: () => materialRepository.list(subjectId), enabled: Boolean(subjectId) }) }
export function useUploadMaterials() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, files }: { subjectId: string; files: File[] }) => materialRepository.upload(subjectId, files), onSuccess: (_data, variables) => client.invalidateQueries({ queryKey: materialKeys.list(variables.subjectId) }) }) }
export function useRetryMaterial() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, materialId }: { subjectId: string; materialId: string }) => materialRepository.retry(subjectId, materialId), onSuccess: (_data, variables) => client.invalidateQueries({ queryKey: materialKeys.list(variables.subjectId) }) }) }
export function useDeleteMaterial() { const client = useQueryClient(); return useMutation({ mutationFn: ({ subjectId, materialId }: { subjectId: string; materialId: string }) => materialRepository.remove(subjectId, materialId), onSuccess: (_data, variables) => client.invalidateQueries({ queryKey: materialKeys.list(variables.subjectId) }) }) }
