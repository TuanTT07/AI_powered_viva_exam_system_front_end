import { useQuery } from '@tanstack/react-query'
import { roleRepository } from './role-repository'
export function useRoles() { return useQuery({ queryKey: ['admin-roles'], queryFn: roleRepository.list }) }
