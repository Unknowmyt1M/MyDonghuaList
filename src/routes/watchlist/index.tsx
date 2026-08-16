import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Star, Bookmark, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useWatchlist, useUpdateWatchlistStatus, useRemoveFromWatchlist, useRateTitle, useToggleFavorite } from '@/queries'
import type { UserTitle, WatchStatus, TitleListItem } from '@/types/database'

const STATUS_ORDER: WatchStatus[] = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']
const STATUS_LABELS: Record<WatchStatus, string> = {
    watching: 'Watching',
    completed: 'Completed',
    on_hold: 'On Hold',
    dropped: 'Dropped',
    plan_to_watch: 'Plan to Watch',
}

function getStatusColor(status: WatchStatus) {
    switch (status) {
        case 'watching': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        case 'dropped': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        case 'plan_to_watch': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    }
}

function WatchlistCard({ item, onStatusChange, onRemove, onRate, onFavoriteToggle }: WatchlistCardProps) {
    const { title } = item
    const userRating = item.score

    return (
        <div className="group relative bg-card border flex flex-col">
            <div className="relative aspect-[2/3] overflow-hidden">
                {title.cover_url ? (
                    <img src={title.cover_url} alt={title.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">����</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="bg-background/90" onClick={(e) => { e.preventDefault(); onRate(userRating ?? 0) }}>
                        <Star className={cn('size-4', userRating ? 'fill-yellow-500 text-yellow-500' : '')} />
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-background/90" onClick={(e) => { e.preventDefault(); onFavoriteToggle() }}>
                        <Bookmark className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-background/90 text-red-500 hover:bg-red-500/10" onClick={(e) => { e.preventDefault(); onRemove() }}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-2 gap-1">
                <Link to={`/title/${title.slug}`} className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {title.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={cn('px-1.5 py-0.5', getStatusColor(item.status))}>
                        {STATUS_LABELS[item.status]}
                    </Badge>
                    {userRating && (
                        <span className="flex items-center gap-1 text-yellow-500">
                            <Star className="size-3 fill-current" />
                            {userRating}
                        </span>
                    )}
                </div>
                <Select value={item.status} onValueChange={onStatusChange} className="mt-auto w-full">
                    <SelectTrigger className="text-xs py-1">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_ORDER.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

function WatchlistRow({ item, onStatusChange, onRemove, onRate, onFavoriteToggle }: WatchlistRowProps) {
    const { title } = item
    const userRating = item.score

    return (
        <div className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
            <Link to={`/title/${title.slug}`} className="w-20 h-28 flex-shrink-0 relative overflow-hidden rounded">
                {title.cover_url ? (
                    <img src={title.cover_url} alt={title.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">����</div>
                )}
            </Link>
            <div className="flex-1 min-w-0">
                <Link to={`/title/${title.slug}`} className="font-medium hover:text-primary">
                    {title.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline" className={cn('px-1.5 py-0.5', getStatusColor(item.status))}>
                        {STATUS_LABELS[item.status]}
                    </Badge>
                    {title.release_year && <span>{title.release_year}</span>}
                    {userRating && (
                        <span className="flex items-center gap-1 text-yellow-500">
                            <Star className="size-3 fill-current" />
                            {userRating}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select value={item.status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-32 text-xs py-1">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_ORDER.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); onRate(userRating ?? 0) }}>
                    <Star className={cn('size-4', userRating ? 'fill-yellow-500 text-yellow-500' : '')} />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); onFavoriteToggle() }}>
                    <Bookmark className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={(e) => { e.preventDefault(); onRemove() }}>
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    )
}

function WatchlistItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-3 bg-card border rounded-lg">
            <Skeleton className="w-20 h-28 rounded" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24" />
        </div>
    )
}

interface WatchlistCardProps {
    item: UserTitle & { title: TitleListItem }
    onStatusChange: (status: WatchStatus) => void
    onRemove: () => void
    onRate: (score: number) => void
    onFavoriteToggle: () => void
}

interface WatchlistRowProps {
    item: UserTitle & { title: TitleListItem }
    onStatusChange: (status: WatchStatus) => void
    onRemove: () => void
    onRate: (score: number) => void
    onFavoriteToggle: () => void
}

function renderWatchlistItem(item: UserTitle & { title: TitleListItem }, viewMode: 'grid' | 'list', handlers: {
    onStatusChange: (status: WatchStatus) => void
    onRemove: () => void
    onRate: (score: number) => void
    onFavoriteToggle: () => void
}) {
    if (viewMode === 'grid') {
        return (
            <WatchlistCard
                key={item.id}
                item={item}
                onStatusChange={handlers.onStatusChange}
                onRemove={handlers.onRemove}
                onRate={handlers.onRate}
                onFavoriteToggle={handlers.onFavoriteToggle}
            />
        )
    }
    return (
        <WatchlistRow
            key={item.id}
            item={item}
            onStatusChange={handlers.onStatusChange}
            onRemove={handlers.onRemove}
            onRate={handlers.onRate}
            onFavoriteToggle={handlers.onFavoriteToggle}
        />
    )
}

export const Route = createFileRoute('/watchlist/')({
    component: WatchlistPage,
})

function WatchlistPage() {
    const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const { data: watchlist } = useWatchlist()
    const updateStatus = useUpdateWatchlistStatus()
    const removeTitle = useRemoveFromWatchlist()
    const rateTitle = useRateTitle()
    const toggleFavorite = useToggleFavorite()

    const filtered = activeTab === 'all'
        ? watchlist ?? []
        : (watchlist ?? []).filter((item) => item.status === activeTab)

    const grouped = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = (watchlist ?? []).filter((item) => item.status === status)
        return acc
    }, {} as Record<WatchStatus, UserTitle[]>)

    const stats = {
        watching: grouped.watching.length,
        completed: grouped.completed.length,
        on_hold: grouped.on_hold.length,
        dropped: grouped.dropped.length,
        plan_to_watch: grouped.plan_to_watch.length,
        total: watchlist?.length ?? 0,
    }

    const handlers = {
        onStatusChange: (status: WatchStatus, titleId: number) => updateStatus.mutate({ titleId, status }),
        onRemove: (titleId: number) => removeTitle.mutate(titleId),
        onRate: (score: number, titleId: number) => rateTitle.mutate({ titleId, score }),
        onFavoriteToggle: (titleId: number) => toggleFavorite.mutate(titleId),
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Watchlist</h1>
                    <p className="text-muted-foreground">{stats.total} titles in your list</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/discover">+ Add Title</Link>
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                    {STATUS_ORDER.map((status) => (
                        <TabsTrigger key={status} value={status}>
                            {STATUS_LABELS[status]} ({stats[status]})
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid view"
                    >
                        <div className="grid grid-cols-2 gap-1 size-4">
                            <div className="bg-primary h-full rounded" />
                            <div className="bg-primary h-full rounded" />
                            <div className="bg-primary h-full rounded" />
                            <div className="bg-primary h-full rounded" />
                        </div>
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        aria-label="List view"
                    >
                        <div className="space-y-1 size-4">
                            <div className="bg-primary h-1 rounded w-full" />
                            <div className="bg-primary h-1 rounded w-3/4" />
                            <div className="bg-primary h-1 rounded w-full" />
                            <div className="bg-primary h-1 rounded w-3/4" />
                        </div>
                    </Button>
                </div>

                <Select value="updated_desc" onValueChange={() => {}}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="updated_desc">Recently Updated</SelectItem>
                        <SelectItem value="score_desc">Highest Rated</SelectItem>
                        <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                        <SelectItem value="progress_desc">Most Progress</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className={cn(viewMode === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'space-y-3')}>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-6xl mb-4">����</div>
                        <h3 className="text-lg font-medium mb-2">
                            {activeTab === 'all' ? 'Your watchlist is empty' : `No titles in "${STATUS_LABELS[activeTab as WatchStatus]}"`}
                        </h3>
                        <p className="text-muted-foreground mb-4">Discover donghua and add them to your list</p>
                        <Button asChild>
                            <Link to="/discover">Browse Donghua</Link>
                        </Button>
                    </div>
                ) : (
                    filtered.map((item) => renderWatchlistItem(item, viewMode, {
                        onStatusChange: (status) => handlers.onStatusChange(status, item.title_id),
                        onRemove: () => handlers.onRemove(item.title_id),
                        onRate: (score) => handlers.onRate(score, item.title_id),
                        onFavoriteToggle: () => handlers.onFavoriteToggle(item.title_id),
                    }))
                )}
            </div>

            {filtered.length > 0 && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Showing {filtered.length} of {stats.total} titles
                </div>
            )}
        </div>
    )
}