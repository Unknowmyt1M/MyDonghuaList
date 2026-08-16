import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Shield, Users, BookOpen, MessageSquare, AlertTriangle, BarChart3, Tags, Loader2, ChevronLeft, ChevronRight, Search, Edit, Trash2, Eye, UserCog } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAdminStats, useAdminUsers, useAdminTitles, useAdminGenres, useAdminTags, useAdminUpdateUserRole } from '@/queries'
import { ReportsTab } from '@/components/admin/reports-tab'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/')({
    component: AdminPage,
    beforeLoad: requireAuth,
})

function AdminPage() {
    const [activeTab, setActiveTab] = useState('overview')

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Shield className="size-8" />
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Manage content, users, and moderation</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview"><BarChart3 className="size-4 mr-2" /> Overview</TabsTrigger>
                    <TabsTrigger value="users"><Users className="size-4 mr-2" /> Users</TabsTrigger>
                    <TabsTrigger value="titles"><BookOpen className="size-4 mr-2" /> Titles</TabsTrigger>
                    <TabsTrigger value="genres"><Tags className="size-4 mr-2" /> Genres & Tags</TabsTrigger>
                    <TabsTrigger value="reviews"><MessageSquare className="size-4 mr-2" /> Reviews</TabsTrigger>
                    <TabsTrigger value="reports"><AlertTriangle className="size-4 mr-2" /> Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview"><OverviewTab /></TabsContent>
                <TabsContent value="users"><UsersTab /></TabsContent>
                <TabsContent value="titles"><TitlesTab /></TabsContent>
                <TabsContent value="genres"><GenresTagsTab /></TabsContent>
                <TabsContent value="reviews"><ReviewsTab /></TabsContent>
                <TabsContent value="reports"><ReportsTab /></TabsContent>
            </Tabs>
        </div>
    )
}

function OverviewTab() {
    const { data: stats, isLoading } = useAdminStats()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Failed to load stats
                </CardContent>
            </Card>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-500' },
        { label: 'Total Titles', value: stats.total_titles, icon: BookOpen, color: 'text-green-500' },
        { label: 'Total Episodes', value: stats.total_episodes, icon: BookOpen, color: 'text-purple-500' },
        { label: 'Published Reviews', value: stats.total_reviews, icon: MessageSquare, color: 'text-yellow-500' },
        { label: 'Active Users (30d)', value: stats.active_users, icon: Users, color: 'text-cyan-500' },
        { label: 'New Signups (30d)', value: stats.new_signups_30d, icon: Users, color: 'text-pink-500' },
        { label: 'Pending Reports', value: stats.pending_reports, icon: AlertTriangle, color: 'text-red-500' },
        { label: 'Airing Titles', value: stats.titles_airing, icon: BookOpen, color: 'text-green-500' },
        { label: 'Upcoming Titles', value: stats.titles_upcoming, icon: BookOpen, color: 'text-orange-500' },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {statCards.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                            <stat.icon className="size-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function UsersTab() {
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('')
    const { data: users, isLoading } = useAdminUsers({ search: search || undefined, role: roleFilter || undefined })
    const updateUserRole = useAdminUpdateUserRole()

    const handleRoleChange = (userId: string, newRole: string) => {
        updateUserRole.mutate(
            { userId, role: newRole },
            { onSuccess: () => toast.success('Role updated') }
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-2">
                    {(!users || users.length === 0) ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">No users found</CardContent>
                        </Card>
                    ) : (
                        users.map((user) => (
                            <Card key={user.id}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="size-10">
                                        <AvatarImage src={user.avatar_url ?? undefined} />
                                        <AvatarFallback>{user.username?.charAt(0)?.toUpperCase() ?? '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">{user.display_name || user.username}</div>
                                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {user.titles_tracked} titles
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                    <Select
                                        value={user.role}
                                        onValueChange={(r) => handleRoleChange(user.id, r)}
                                    >
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function TitlesTab() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const { data: titles, isLoading } = useAdminTitles({ search: search || undefined, status: statusFilter || undefined })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search titles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="Airing">Airing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Hiatus">Hiatus</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-2">
                    {(!titles || titles.length === 0) ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">No titles found</CardContent>
                        </Card>
                    ) : (
                        titles.map((title) => (
                            <Card key={title.id}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">{title.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {title.type} · {title.release_year ?? 'N/A'}
                                        </div>
                                    </div>
                                    <Badge variant={title.status === 'Airing' ? 'default' : 'outline'}>
                                        {title.status}
                                    </Badge>
                                    <div className="text-sm text-muted-foreground">
                                        ⭐ {title.average_rating.toFixed(1)} ({title.rating_count})
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ❤️ {title.favorites_count}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function GenresTagsTab() {
    const { data: genres, isLoading: loadingGenres } = useAdminGenres()
    const { data: tags, isLoading: loadingTags } = useAdminTags()

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Genres</CardTitle>
                    <CardDescription>Manage genre categories</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingGenres ? (
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="space-y-2">
                            {genres?.map((genre) => (
                                <div key={genre.id} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                                    <div>
                                        <div className="font-medium">{genre.name}</div>
                                        <div className="text-xs text-muted-foreground">{genre.title_count} titles</div>
                                    </div>
                                    <Badge variant="secondary">{genre.slug}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>Manage content tags</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingTags ? (
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="space-y-2">
                            {tags?.map((tag) => (
                                <div key={tag.id} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                                    <div>
                                        <div className="font-medium">{tag.name}</div>
                                        <div className="text-xs text-muted-foreground">{tag.title_count} titles · {tag.category ?? 'uncategorized'}</div>
                                    </div>
                                    <Badge variant="outline">{tag.slug}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function ReviewsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
                <CardDescription>View and manage all reviews across titles</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Full review moderation dashboard. Use the Reports tab for active moderation of flagged content.</p>
            </CardContent>
        </Card>
    )
}