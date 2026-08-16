import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface PlaceholderPageProps {
  title: string
  description: string
  backTo?: { to: string; label: string }
}

export function PlaceholderPage({
  title,
  description,
  backTo,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
        {backTo ? (
          <div className="mt-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={backTo.to}>← Back to {backTo.label}</Link>
            </Button>
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}