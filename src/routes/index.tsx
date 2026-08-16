import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Calendar } from 'lucide-react'
import { useTrendingTitles, useAiringTitles, useUpcomingTitles } from '@/queries'
import type { TitleListItem } from '@/types/database'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function Hero() {
  return (
    <section className="border-b bg-gradient-to-b from-accent/30 to-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16">
        <h1 className="max-w-2xl text-4xl font-bold sm:text-5xl">
          Track every donghua you love
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Watchlists, episode progress, release alerts, and recommendations —
          all in one place for Chinese animation.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link to="/discover">Discover donghua</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth/signup">Sign up free</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function TitleCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-40">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

function TitleCardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <TitleCardSkeleton key={i} />
      ))}
    </div>
  )
}

function TitleCard({ title }: { title: TitleListItem }) {
  return (
    <Link to={`/title/${title.slug}`} className="group flex flex-col gap-2 w-40">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        {title.cover_url ? (
          <img
            src={title.cover_url}
            alt={title.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🎬</div>
        )}
        {title.status === 'Airing' && (
          <span className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-0.5 rounded">
            Airing
          </span>
        )}
        {title.average_rating > 0 && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {title.average_rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {title.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {title.release_year && <span>{title.release_year}</span>}
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto">{title.type}</Badge>
        </div>
      </div>
    </Link>
  )
}

function TitleSection({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button variant="link" asChild>
          <Link to={to}>View all</Link>
        </Button>
      </div>
      {children}
    </section>
  )
}

function HomePage() {
  const { data: trending, isLoading: loadingTrending } = useTrendingTitles(10)
  const { data: airing, isLoading: loadingAiring } = useAiringTitles(10)
  const { data: upcoming, isLoading: loadingUpcoming } = useUpcomingTitles(10)

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />

      <TitleSection title="Currently Airing" to="/discover">
        {loadingAiring ? (
          <TitleCardGridSkeleton />
        ) : !airing || airing.length === 0 ? (
          <p className="text-muted-foreground">No airing titles found</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {airing.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </div>
        )}
      </TitleSection>

      <TitleSection title="Trending" to="/discover">
        {loadingTrending ? (
          <TitleCardGridSkeleton />
        ) : !trending || trending.length === 0 ? (
          <p className="text-muted-foreground">No trending titles found</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {trending.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </div>
        )}
      </TitleSection>

      <TitleSection title="Upcoming" to="/calendar">
        {loadingUpcoming ? (
          <TitleCardGridSkeleton />
        ) : !upcoming || upcoming.length === 0 ? (
          <p className="text-muted-foreground">No upcoming titles found</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {upcoming.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </div>
        )}
      </TitleSection>
    </div>
  )
}