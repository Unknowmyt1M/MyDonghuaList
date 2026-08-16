import { useState } from 'react'
import { Flag, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useReportReview } from '@/queries'
import { toast } from 'sonner'

const REPORT_REASONS = [
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'harassment', label: 'Harassment or hate speech' },
    { value: 'spoiler', label: 'Unmarked spoilers' },
    { value: 'offensive', label: 'Offensive content' },
    { value: 'misinformation', label: 'False information' },
    { value: 'other', label: 'Other' },
]

interface ReportModalProps {
    reviewId: string
    onClose: () => void
}

export function ReportModal({ reviewId, onClose }: ReportModalProps) {
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')
    const reportReview = useReportReview()

    const handleSubmit = () => {
        if (!reason) return

        reportReview.mutate(
            { reviewId, reason, description: description.trim() || undefined },
            {
                onSuccess: () => {
                    toast.success('Report submitted. Our team will review it.')
                    onClose()
                },
                onError: () => {
                    toast.error('Failed to submit report. Please try again.')
                },
            }
        )
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flag className="size-5 text-destructive" />
                        Report Review
                    </DialogTitle>
                    <DialogDescription>
                        Why are you reporting this review? Reports are reviewed by our moderation team.
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup value={reason} onValueChange={setReason}>
                    {REPORT_REASONS.map((r) => (
                        <div key={r.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={r.value} id={r.value} />
                            <Label htmlFor={r.value} className="cursor-pointer">{r.label}</Label>
                        </div>
                    ))}
                </RadioGroup>

                <div>
                    <Label className="text-sm mb-2 block">Additional details (optional)</Label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide more context about why you're reporting this review..."
                        className="min-h-[80px]"
                        disabled={reportReview.isPending}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={reportReview.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!reason || reportReview.isPending}
                    >
                        {reportReview.isPending ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                            <Flag className="size-4 mr-2" />
                        )}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}