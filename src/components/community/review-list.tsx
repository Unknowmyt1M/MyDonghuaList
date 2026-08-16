import { useState } from 'react'
import { MessageSquare, ArrowUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ReviewCard } from './review-card'
import { useTitleReviews, useUserReviews } from '@/queries'
import { ReportModal } from './report-modal'
import { ReviewComposer } from './review-composer'
import { useAuth } from '@/components/auth/auth-provider'

interface ReviewListProps {
    titleId: number
    mode?: 'title' | 'user'
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
    { value: 'helpful', label: 'Most Helpful' },
]

export function ReviewList({ titleId, mode = 'title' }: ReviewListProps) {
    const { user } = useAuth()
    const [sort, setSort] = useState('newest')
    const [showComposer, setShowComposer] = useState(false)
    const [reportReviewId, setReportReviewId] = useState<string | null>(null)

    const { data: titleReviews, isLoading: loadingTitle } = useTitleReviews(titleId, sort)
    const { data: userReviews, isLoading: loadingUser } = useUserReviews()

    const isLoading = mode === 'title' ? loadingTitle : loadingUser
    const reviews = mode === 'title' ? titleReviews : userReviews

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    Reviews ({reviews?.length ?? 0})
                </h3>
                <div className="flex items-center gap-2">
                    {mode === 'title' && (
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="w-[160px]">
                                <ArrowUpDown className="size-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {mode === 'title' && user && !showComposer && (
                        <Button size="sm" onClick={() => setShowComposer(true)}>
                            Write Review
                        </Button>
                    )}
                </div>
            </div>

            {showComposer && mode === 'title' && (
                <ReviewComposer
                    titleId={titleId}
                    onSubmitted={() => setShowComposer(false)}
                />
            )}

            {(!reviews || reviews.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                    <p>No reviews yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            isOwn={review.user_id === user?.id}
                            onReport={() => setReportReviewId(review.id)}
                        />
                    ))}
                </div>
            )}

            {reportReviewId && (
                <ReportModal
                    reviewId={reportReviewId}
                    onClose={() => setReportReviewId(null)}
                />
            )}
        </div>
    )
}