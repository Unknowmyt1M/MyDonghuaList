import { Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/queries'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const NOTIFICATION_ICONS: Record<string, string> = {
    episode_release: '📺',
    watchlist_update: '📋',
    review_like: '👍',
    system: '🔔',
    recommendation: '✨',
}

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const { data: notifications, isLoading } = useNotifications(true)
    const markRead = useMarkNotificationRead()
    const markAllRead = useMarkAllNotificationsRead()

    const unreadCount = notifications?.length ?? 0

    const handleMarkAllRead = () => {
        markAllRead.mutate(undefined, { onSuccess: () => setOpen(false) })
    }

    const handleNotificationClick = (id: string) => {
        markRead.mutate(id)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-medium text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : !notifications || notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No unread notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className="w-full p-3 text-left hover:bg-accent/50 transition-colors"
                                    onClick={() => handleNotificationClick(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">
                                            {NOTIFICATION_ICONS[notification.type] ?? '🔔'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{notification.title}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}