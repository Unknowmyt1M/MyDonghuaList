import { Loader2, Check, X, Eye, EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Link } from '@tanstack/react-router'
import { usePendingReports, useAdminModerateReview, useAdminResolveReport } from '@/queries'
import { toast } from 'sonner'

export function ReportsTab() {
    const { data: reports, isLoading } = usePendingReports()
    const moderateReview = useAdminModerateReview()
    const resolveReport = useAdminResolveReport()

    const handleModerateReview = (reviewId: string, status: 'published' | 'hidden' | 'removed') => {
        moderateReview.mutate(
            { reviewId, status },
            { onSuccess: () => toast.success(`Review ${status}`) }
        )
    }

    const handleResolveReport = (reportId: string, status: 'resolved' | 'dismissed') => {
        resolveReport.mutate(
            { reportId, status },
            { onSuccess: () => toast.success(`Report ${status}`) }
        )
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (!reports || reports.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Check className="size-8 mx-auto mb-2 text-green-500" />
                    No pending reports
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {reports.map((report) => (
                <Card key={report.id}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="destructive">{report.reason}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Reported by {report.report_username}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {report.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                                )}
                                <Separator className="my-2" />
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Review by </span>
                                    <span className="font-medium">{report.review_username}</span>
                                    <span className="text-muted-foreground"> on </span>
                                    <Link to={`/title/${report.title_id}`} className="text-primary hover:underline">
                                        {report.title_name}
                                    </Link>
                                </div>
                                <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                                    &quot;{report.review_body}&quot;
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleModerateReview(report.review_id, 'hidden')}
                                disabled={moderateReview.isPending || resolveReport.isPending}
                            >
                                <EyeOff className="size-3 mr-1" />
                                Hide
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleModerateReview(report.review_id, 'removed')}
                                disabled={moderateReview.isPending || resolveReport.isPending}
                            >
                                <Trash2 className="size-3 mr-1" />
                                Remove
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleModerateReview(report.review_id, 'published')}
                                disabled={moderateReview.isPending || resolveReport.isPending}
                            >
                                <Eye className="size-3 mr-1" />
                                Restore
                            </Button>
                            <Separator orientation="vertical" className="h-6 mx-2" />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report.id, 'resolved')}
                                disabled={moderateReview.isPending || resolveReport.isPending}
                            >
                                <Check className="size-3 mr-1" />
                                Resolve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                                disabled={moderateReview.isPending || resolveReport.isPending}
                            >
                                <X className="size-3 mr-1" />
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}