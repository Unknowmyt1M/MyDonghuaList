import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TitleCardSkeletonProps {
    variant?: 'default' | 'compact'
}

export function TitleCardSkeleton({ variant = 'default' }: TitleCardSkeletonProps) {
    return (
        <div className={cn('flex flex-col bg-card border', variant === 'compact' ? 'w-32' : 'w-40 sm:w-44')}>
            <Skeleton className="aspect-[2/3] w-full" />
            <div className="flex flex-1 flex-col p-2 gap-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="mt-auto flex flex-wrap items-center gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>
        </div>
    )
}