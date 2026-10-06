import type { DataSourceMode } from './runtime-config'
export function selectRepository<T>(mode: DataSourceMode, repositories: { mock: T; api: T }): T { return repositories[mode] }
