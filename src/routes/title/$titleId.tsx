import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Star, Bookmark, Clock, Calendar, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTitleDetail, useEpisodesByTitle, useUpdateWatchlistStatus, useToggleFavorite, useRateTitle, useToggleSubscription, useUpdateEpisodeProgress, useRecommendations } from '@/queries'
import { ReviewList } from '@/components/community'
import { TitleCard } from '@/components/donghua/title-card'
import type { Episode, WatchStatus } from '@/types/database'

export const Route = createFileRoute('/title/$titleId')({
    component: TitlePage,
})

function renderEpisodes(seasonEpisodes: Episode[], updateProgress: { mutate: (args: { episodeId: number; watched: boolean }) => void }) {
    if (seasonEpisodes.length === 0) {
        return (
            <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No episodes available for this season
                </td>
            </tr>
        )
    }

    return seasonEpisodes.map((ep) => {
        const isAired = ep.air_date && new Date(ep.air_date) <= new Date()
        const isWatched = false
        return (
            <tr key={ep.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                <td className="py-3 pr-4 text-sm font-mono text-muted-foreground">
                    {ep.episode_number}
                </td>
                <td className="py-3 pr-4">
                    <div className="font-medium truncate">{ep.title || `Episode ${ep.episode_number}`}</div>
                    {ep.description && (
                        <div className="text-sm text-muted-foreground truncate">{ep.description}</div>
                    )}
                </td>
                <td className="py-3 pr-4 text-sm text-muted-foreground">
                    {ep.air_date ? new Date(ep.air_date).toLocaleDateString() : 'TBA'}
                </td>
                <td className="py-3 pr-4 text-sm text-muted-foreground">
                    {ep.duration} min
                </td>
                <td className="py-3">
                    {isAired ? (
                        <Button
                            variant={isWatched ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => updateProgress.mutate({ episodeId: ep.id, watched: !isWatched })}
                        >
                            <Check className="size-4" />
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            Not aired
                        </span>
                    )}
                </td>
            </tr>
        )
    })
}

function TitlePage() {
    const { titleId: slug } = Route.useParams()
    const numericId = Number(slug)

    const { data: title, isLoading } = useTitleDetail(numericId)
    const { data: episodes } = useEpisodesByTitle(numericId)
    const { data: recommendations } = useRecommendations(numericId, 6)

    const updateWatchlist = useUpdateWatchlistStatus()
    const toggleFavorite = useToggleFavorite()
    const rateTitle = useRateTitle()
    const toggleSubscription = useToggleSubscription()
    const updateProgress = useUpdateEpisodeProgress()

    const [activeSeason, setActiveSeason] = useState<number | null>(null)
    const [userStatus, setUserStatus] = useState<WatchStatus | null>(null)
    const [userRating, setUserRating] = useState<number | null>(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <TitleDetailSkeleton />
            </div>
        )
    }

    if (!title) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-2">Title not found</h1>
                <Link to="/discover" className="text-primary hover:underline">Back to Discover</Link>
            </div>
        )
    }

    const seasons = title.seasons ?? []
    const currentSeason = seasons.find((s) => s.season_number === activeSeason) ?? seasons[0]
    const seasonEpisodes = episodes?.filter((e) => e.season_id === currentSeason?.id) ?? []

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <Link to="/discover" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                ← Back to Discover
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex gap-6">
                        <div className="relative w-64 h-96 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            {title.cover_url ? (
                                <img src={title.cover_url} alt={title.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
                            )}
                            {title.status === 'Airing' && (
                                <span className="absolute top-3 left-3 bg-green-500/90 text-white text-xs px-2 py-1 rounded">
                                    Airing
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className="capitalize">{title.type.toLowerCase()}</Badge>
                                <Badge variant={title.status === 'Airing' ? 'default' : 'outline'}>
                                    {title.status}
                                </Badge>
                                {title.release_year && <Badge variant="outline">{title.release_year}</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{title.title}</h1>
                            {title.original_title && title.original_title !== title.title && (
                                <p className="text-muted-foreground mb-4">{title.original_title}</p>
                            )}
                            {title.native_title && (
                                <p className="text-muted-foreground mb-4 font-mono">{title.native_title}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                                {title.duration && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-4" />
                                        {title.duration} min/ep
                                    </span>
                                )}
                                {title.total_episodes > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-4" />
                                        {title.total_episodes} eps
                                    </span>
                                )}
                                {title.start_date && (
                                    <span>
                                        Started: {new Date(title.start_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star className="size-5 fill-yellow-500 text-yellow-500" />
                                    <span className="font-semibold text-lg">{title.average_rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({title.rating_count} ratings)</span>
                                </div>
                                <Button
                                    variant={isFavorite ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => {
                                        toggleFavorite.mutate(title.id, {
                                            onSuccess: (res) => { setIsFavorite(res.favorited) }
                                        })
                                    }}
                                    disabled={toggleFavorite.isPending}
                                >
                                    <Bookmark className={cn('size-5', isFavorite ? 'fill-current text-red-500' : '')} />
                                </Button>
                                <Button
                                    variant={isSubscribed ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => {
                                        toggleSubscription.mutate(title.id, {
                                            onSuccess: (res) => { setIsSubscribed(res.subscribed) }
                                        })
                                    }}
                                    disabled={toggleSubscription.isPending}
                                >
                                    <AlertTriangle className={cn('size-5', isSubscribed ? 'fill-current text-primary' : '')} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Synopsis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {title.description || 'No description available.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Episodes</CardTitle>
                                {seasons.length > 1 && (
                                    <Select value={activeSeason?.toString() ?? ''} onValueChange={(v) => setActiveSeason(v ? Number(v) : null)}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select Season" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {seasons.map((s) => (
                                                <SelectItem key={s.id} value={s.season_number.toString()}>
                                                    {s.name || `Season ${s.season_number}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left text-sm text-muted-foreground">
                                            <th className="pb-2 pr-4 w-12">#</th>
                                            <th className="pb-2 pr-4">Title</th>
                                            <th className="pb-2 pr-4">Air Date</th>
                                            <th className="pb-2 pr-4 w-24">Duration</th>
                                            <th className="pb-2 w-28">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderEpisodes(seasonEpisodes, updateProgress)}
                                    </tbody>
                                </table>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Genres</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {title.genres?.map((g) => (
                                        <Badge key={g.id} variant="secondary">{g.name}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {title.tags?.map((t) => (
                                        <Badge key={t.id} variant="outline">{t.name}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reviews */}
                    <ReviewList titleId={title.id} />

                    {/* Recommendations */}
                    {recommendations && recommendations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Similar Titles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {recommendations.map((rec) => (
                                        <Link
                                            key={rec.id}
                                            to={`/title/${rec.slug}`}
                                            className="flex flex-col gap-2 w-32 flex-shrink-0 group"
                                        >
                                            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
                                                {rec.cover_url ? (
                                                    <img
                                                        src={rec.cover_url}
                                                        alt={rec.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-3xl">🎬</div>
                                                )}
                                                {rec.average_rating > 0 && (
                                                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5">
                                                        <Star className="size-2.5 fill-yellow-400 text-yellow-400" />
                                                        {rec.average_rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                {rec.title}
                                            </h4>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'] as WatchStatus[]).map((status) => (
                                        <Button
                                            key={status}
                                            variant={userStatus === status ? 'default' : 'outline'}
                                            className="capitalize text-xs"
                                            onClick={() => {
                                                updateWatchlist.mutate({ titleId: title.id, status }, {
                                                    onSuccess: () => setUserStatus(status),
                                                })
                                            }}
                                            disabled={updateWatchlist.isPending}
                                        >
                                            {status.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <label className="block text-sm font-medium mb-2">Your Rating</label>
                                <div className="flex gap-1">
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                                        <Button
                                            key={star}
                                            variant={userRating >= star ? 'default' : 'outline'}
                                            size="icon"
                                            className={cn('h-8 w-8', userRating >= star && 'bg-yellow-500 border-yellow-500')}
                                            onClick={() => {
                                                rateTitle.mutate({ titleId: title.id, score: star }, {
                                                    onSuccess: () => setUserRating(star),
                                                })
                                            }}
                                            disabled={rateTitle.isPending}
                                        >
                                            <Star className={cn('size-4', userRating >= star ? 'fill-current' : '')} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Information</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="capitalize">{title.type.toLowerCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={title.status === 'Airing' ? 'default' : 'outline'}>{title.status}</Badge>
                            </div>
                            {title.release_year && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Year</span>
                                    <span>{title.release_year}</span>
                                </div>
                            )}
                            {title.total_episodes && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Episodes</span>
                                    <span>{title.total_episodes}</span>
                                </div>
                            )}
                            {title.duration && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span>{title.duration} min/ep</span>
                                </div>
                            )}
                            {title.source && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Source</span>
                                    <span className="capitalize">{title.source}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function TitleDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex gap-6">
                <Skeleton className="w-64 h-96 rounded-lg" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-8 w-3/4" />
                </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}