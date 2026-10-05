export type ApiClient = { request: <T>(input: RequestInfo | URL, init?: RequestInit) => Promise<T> }
export const apiClient: ApiClient = { async request<T>(input: RequestInfo | URL, init?: RequestInit) { const response = await fetch(input, init); if (!response.ok) throw new Error(`Request failed with status ${response.status}`); return response.json() as Promise<T> } }
