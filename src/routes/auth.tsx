import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-semibold">
        <span>🐉</span> TrackMyDonghua
      </div>
      <Outlet />
    </div>
  )
}