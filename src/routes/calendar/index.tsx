import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAiringTitles, useEpisodesByTitle } from '@/queries'
import type { TitleListItem, Episode } from '@/types/database'

export const Route = createFileRoute('/calendar/')({
    component: CalendarPage,
})

function CalendarPage() {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDate, setSelectedDate] = useState(new Date())

    const { data: airingTitles } = useAiringTitles(50)

    // Get episodes for all airing titles
    const allEpisodes: (Episode & { title: TitleListItem })[] = []
    airingTitles?.forEach((title) => {
        // In a real app, this would be a separate query or pre-fetched
        // For now, we'll show a placeholder calendar
    })

    const startOfWeek = getStartOfWeek(selectedDate)
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek)
        date.setDate(date.getDate() + i)
        return date
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Release Calendar</h1>
                    <p className="text-muted-foreground">Track upcoming episode releases</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="font-medium min-w-[200px] text-center">
                        {formatWeekRange(startOfWeek)}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
                        <ChevronRight className="size-4" />
                    </Button>
                    <Button variant="outline" onClick={() => { setWeekOffset(0); setSelectedDate(new Date()) }}>
                        Today
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="week" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="week">Week View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
                </TabsList>

                <TabsContent value="week">
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => (
                            <DayColumn key={index} date={day} today={today} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="list">
                    <CalendarListView />
                </TabsContent>

                <TabsContent value="subscriptions">
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="size-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No subscriptions yet</h3>
                        <p>Subscribe to titles on their detail pages to see their episodes here</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function DayColumn({ date, today }: { date: Date; today: Date }) {
    const isToday = date.getTime() === today.getTime()
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNumber = date.getDate()

    // Mock episodes for demonstration
    const mockEpisodes = [
        { title: 'Renegade Immortal', episode: 128, time: '20:00', aired: true },
        { title: 'Battle Through the Heavens', episode: 95, time: '19:30', aired: false },
    ].filter(() => Math.random() > 0.7)

    return (
        <Card className={cn('h-full flex flex-col', isToday && 'ring-2 ring-primary')}>
            <CardHeader className={cn('pb-2', isToday && 'bg-primary/10')}>
                <div className="flex items-center justify-between">
                    <span className={cn('font-medium', isToday && 'text-primary')}>
                        {dayName} {dayNumber}
                    </span>
                    {isToday && <Badge variant="default" className="text-xs">Today</Badge>}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                {mockEpisodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No episodes</p>
                ) : (
                    mockEpisodes.map((ep, i) => (
                        <div key={i} className="p-2 bg-accent/50 rounded text-sm">
                            <div className="font-medium truncate">{ep.title}</div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Ep {ep.episode}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {ep.time}
                                </span>
                            </div>
                            {ep.aired && <Badge variant="default" className="text-xs w-full">Aired</Badge>}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

function CalendarListView() {
    // Placeholder for list view
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center text-2xl">����</div>
                            <div>
                                <div className="font-medium">Renegade Immortal</div>
                                <div className="text-sm text-muted-foreground">Episode 128 • Today at 20:00</div>
                            </div>
                        </div>
                        <Badge variant="default">Aired</Badge>
                    </div>
                </Card>
            ))}
        </div>
    )
}

function getStartOfWeek(date: Date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
}

function formatWeekRange(start: Date) {
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}