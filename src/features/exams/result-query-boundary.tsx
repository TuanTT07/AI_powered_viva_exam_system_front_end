import { useContext, type ReactNode } from 'react'
import { QueryClient, QueryClientContext, QueryClientProvider } from '@tanstack/react-query'
const fallback = new QueryClient({ defaultOptions: { queries: { retry: false } } })
export function ResultQueryBoundary({ children }: { children: ReactNode }) {
  return useContext(QueryClientContext) ? children : <QueryClientProvider client={fallback}>{children}</QueryClientProvider>
}
