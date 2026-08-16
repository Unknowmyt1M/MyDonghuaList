import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/app-shell'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: RootComponent,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}