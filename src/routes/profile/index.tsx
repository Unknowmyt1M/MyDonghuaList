import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '@/components/auth/auth-provider'
import { Star, Clock, Calendar, Bookmark, Award, Flame, Trophy, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserStatistics, useWatchlist, useFavorites, useRatings } from '@/queries'
import type { UserTitle } from '@/types/database'

export const Route = createFileRoute('/profile/')({
    component: ProfilePage,
    beforeLoad: ({ location }) => {
        // Allow viewing own profile or redirect to login
    },
})

function ProfilePage() {
    const { user } = useAuth()
    const { data: stats } = useUserStatistics()
    const { data: watchlist } = useWatchlist()
    const { data: favorites } = useFavorites()
    const { data: ratings } = useRatings()

    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Profile Header */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                            <AvatarFallback className="text-4xl">
                                {username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold">{username}</h1>
                            <p className="text-muted-foreground">@{username}</p>
                            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <Button variant="outline" asChild>
                                    <Link to="/settings">Edit Profile</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to={`/profile/${username}`}>View Public Profile</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="text-center">
                                <div className="font-bold text-2xl">{watchlist?.length ?? 0}</div>
                                <div>Titles</div>
                            </div>
                            <Separator className="h-8" />
                            <div className="text-center">
                                <div className="font-bold text-2xl">{favorites?.length ?? 0}</div>
                                <div>Favorites</div>
                            </div>
                            <Separator className="h-8" />
                            <div className="text-center">
                                <div className="font-bold text-2xl">{ratings?.length ?? 0}</div>
                                <div>Ratings</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatCard icon={Award} label="Completed" value={stats?.completed_count ?? 0} color="text-green-500" />
                <StatCard icon={Flame} label="Watching" value={stats?.watching_count ?? 0} color="text-blue-500" />
                <StatCard icon={Clock} label="Hours Watched" value={Math.round((stats?.minutes_watched ?? 0) / 60)} color="text-purple-500" />
                <StatCard icon={Star} label="Avg Score" value={stats?.average_score ?? 0} color="text-yellow-500" />
            </div>

            {/* Detailed Stats */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Watchlist Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <StatItem label="Watching" value={stats?.watching_count ?? 0} color="blue" />
                        <StatItem label="Completed" value={stats?.completed_count ?? 0} color="green" />
                        <StatItem label="On Hold" value={stats?.on_hold_count ?? 0} color="yellow" />
                        <StatItem label="Dropped" value={stats?.dropped_count ?? 0} color="red" />
                        <StatItem label="Plan to Watch" value={stats?.plan_to_watch_count ?? 0} color="purple" />
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Tabs defaultValue="recent" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="recent">Recently Updated</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                    <TabsTrigger value="ratings">Ratings</TabsTrigger>
                </TabsList>

                <TabsContent value="recent">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(watchlist ?? []).slice(0, 6).map((item) => (
                            <ProfileTitleCard key={item.id} item={item} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="favorites">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(favorites ?? []).slice(0, 6).map((fav) => (
                            <ProfileTitleCard key={fav.title_id} item={{ ...fav, status: 'completed' as const }} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="ratings">
                    <div className="space-y-3">
                        {(ratings ?? []).slice(0, 10).map((rating) => (
                            <RatingRow key={rating.id} rating={rating} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-3xl font-bold">{value}</p>
                    </div>
                    <div className={cn('p-3 rounded-full bg-muted', color)}>
                        <Icon className="size-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return (
        <div className="text-center p-4">
            <div className={cn('text-3xl font-bold mb-1', colorClasses[color as keyof typeof colorClasses])}>
                {value}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
        </div>
    )
}

function ProfileTitleCard({ item }: { item: UserTitle & { title: { id: number; slug: string; title: string; cover_url: string | null } } }) {
    const { title } = item
    return (
        <Link to={`/title/${title.slug}`} className="group flex gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="w-20 h-28 flex-shrink-0 relative overflow-hidden rounded">
                {title.cover_url ? (
                    <img src={title.cover_url} alt={title.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">���</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">{title.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline" className="px-1.5 py-0.5 text-xs">{item.status.replace('_', ' ')}</Badge>
                    {item.score && (
                        <span className="flex items-center gap-1 text-yellow-500">
                            <Star className="size-3 fill-current" />
                            {item.score}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

function RatingRow({ rating }: { rating: { id: number; score: number; created_at: string; title: { id: number; slug: string; title: string; cover_url: string | null } } }) {
    return (
        <Link to={`/title/${rating.title.slug}`} className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="w-12 h-16 flex-shrink-0 relative overflow-hidden rounded">
                {rating.title.cover_url ? (
                    <img src={rating.title.cover_url} alt={rating.title.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xl">���</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{rating.title.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="size-4 fill-current" />
                        {rating.score}
                    </span>
                    <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </Link>
    )
}