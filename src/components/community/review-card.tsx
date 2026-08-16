import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Flag, AlertTriangle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToggleReviewReaction } from '@/queries'
import type { TitleReview } from '@/queries'

interface ReviewCardProps {
    review: TitleReview
    isOwn?: boolean
    onEdit?: () => void
    onDelete?: () => void
    onReport?: () => void
}

export function ReviewCard({ review, isOwn = false, onEdit, onDelete, onReport }: ReviewCardProps) {
    const [showSpoiler, setShowSpoiler] = useState(false)
    const toggleReaction = useToggleReviewReaction()

    const handleReaction = (reaction: 'helpful' | 'not_helpful') => {
        toggleReaction.mutate({ reviewId: review.id, reaction })
    }

    return (
        <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                        <AvatarImage src={review.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                            {review.display_name?.charAt(0)?.toUpperCase() ?? review.username?.charAt(0)?.toUpperCase() ?? '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-sm">
                            {review.display_name || review.username}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            {review.updated_at !== review.created_at && (
                                <span className="text-muted-foreground">(edited)</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                'size-3',
                                star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'
                            )}
                        />
                    ))}
                </div>
            </div>

            {review.spoiler && !showSpoiler ? (
                <div className="relative">
                    <div className="blur-sm select-none text-muted-foreground text-sm">
                        {review.body.slice(0, 200)}...
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute inset-0 m-auto w-auto h-auto bg-background/80 backdrop-blur-sm"
                        onClick={() => setShowSpoiler(true)}
                    >
                        <AlertTriangle className="size-4 mr-2" />
                        Contains Spoilers — Click to reveal
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.body}</p>
            )}

            <Separator />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant={review.user_reaction === 'helpful' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction('helpful')}
                        disabled={toggleReaction.isPending}
                    >
                        <ThumbsUp className="size-3 mr-1" />
                        {review.helpful_count > 0 && review.helpful_count}
                    </Button>
                    <Button
                        variant={review.user_reaction === 'not_helpful' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction('not_helpful')}
                        disabled={toggleReaction.isPending}
                    >
                        <ThumbsDown className="size-3 mr-1" />
                        {review.not_helpful_count > 0 && review.not_helpful_count}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {isOwn ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={onEdit}>
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
                                Delete
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={onReport}>
                            <Flag className="size-3 mr-1" />
                            Report
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}