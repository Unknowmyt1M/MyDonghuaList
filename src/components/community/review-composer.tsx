import { useState } from 'react'
import { Star, AlertTriangle, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useCreateReview, useUpdateReview } from '@/queries'

interface ReviewComposerProps {
    titleId: number
    existingReview?: {
        id: string
        rating: number
        body: string
        spoiler: boolean
    } | null
    onSubmitted?: () => void
}

export function ReviewComposer({ titleId, existingReview, onSubmitted }: ReviewComposerProps) {
    const [rating, setRating] = useState(existingReview?.rating ?? 5)
    const [body, setBody] = useState(existingReview?.body ?? '')
    const [spoiler, setSpoiler] = useState(existingReview?.spoiler ?? false)
    const [hoveredStar, setHoveredStar] = useState<number | null>(null)

    const createReview = useCreateReview()
    const updateReview = useUpdateReview()

    const isEditing = !!existingReview
    const isPending = createReview.isPending || updateReview.isPending

    const handleSubmit = () => {
        if (!body.trim()) return

        if (isEditing) {
            updateReview.mutate(
                {
                    id: existingReview.id,
                    titleId,
                    rating,
                    body: body.trim(),
                    spoiler,
                },
                { onSuccess: () => onSubmitted?.() }
            )
        } else {
            createReview.mutate(
                { titleId, rating, body: body.trim(), spoiler },
                { onSuccess: () => { setBody(''); setRating(5); setSpoiler(false); onSubmitted?.() } }
            )
        }
    }

    return (
        <div className="bg-card border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">
                {isEditing ? 'Edit Review' : 'Write a Review'}
            </h3>

            <div>
                <Label className="text-sm mb-2 block">Rating</Label>
                <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                        <Button
                            key={star}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'size-8',
                                (hoveredStar ?? rating) >= star && 'bg-yellow-500/20'
                            )}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={cn(
                                    'size-4',
                                    (hoveredStar ?? rating) >= star
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-muted-foreground'
                                )}
                            />
                        </Button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">{rating}/10</span>
                </div>
            </div>

            <div>
                <Label className="text-sm mb-2 block">Review</Label>
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share your thoughts about this title..."
                    className="min-h-[120px]"
                    disabled={isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    {body.length}/5000 characters
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Switch
                    id="spoiler-toggle"
                    checked={spoiler}
                    onCheckedChange={setSpoiler}
                    disabled={isPending}
                />
                <Label htmlFor="spoiler-toggle" className="text-sm cursor-pointer flex items-center gap-2">
                    <AlertTriangle className="size-4 text-yellow-500" />
                    Contains spoilers
                </Label>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isPending || !body.trim() || body.length > 5000}
                >
                    {isPending ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="size-4 mr-2" />
                    )}
                    {isEditing ? 'Update Review' : 'Submit Review'}
                </Button>
            </div>
        </div>
    )
}