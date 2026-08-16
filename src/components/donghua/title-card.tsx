import { Link } from '@tanstack/react-router'
import { Bookmark, Star, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TitleListItem } from '@/types/database'

interface TitleCardProps {
    title: TitleListItem
    variant?: 'default' | 'compact'
    showActions?: boolean
    onFavoriteToggle?: (id: number) => void
    isFavorite?: boolean
    onRatingChange?: (id: number, score: number) => void
    userRating?: number
}

export function TitleCard({
    title,
    variant = 'default',
    showActions = false,
    onFavoriteToggle,
    isFavorite,
    onRatingChange,
    userRating,
}: TitleCardProps) {
    const rating = userRating ?? title.average_rating
    const hasRating = rating > 0

    return (
        <Link
            to={`/title/${title.slug}`}
            className={cn(
                'group flex flex-col bg-card border transition-all hover:shadow-lg',
                variant === 'compact' ? 'w-32' : 'w-40 sm:w-44'
            )}
        >
            <div className="relative aspect-[2/3] overflow-hidden">
                {title.cover_url ? (
                    <img
                        src={title.cover_url}
                        alt={title.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">
                        ���
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {title.status === 'Airing' && (
                    <span className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-1.5 py-0.5 rounded">
                        Airing
                    </span>
                )}
                {title.status === 'Upcoming' && (
                    <span className="absolute top-2 left-2 bg-blue-500/90 text-white text-xs px-1.5 py-0.5 rounded">
                        Upcoming
                    </span>
                )}
                {showActions && (
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onFavoriteToggle && (
                            <button
                                onClick={(e) => { e.preventDefault(); onFavoriteToggle(title.id) }}
                                className={cn(
                                    'p-1.5 rounded-full bg-background/90 backdrop-blur transition-colors',
                                    isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                                )}
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Bookmark className={cn('size-4', isFavorite ? 'fill-current' : '')} />
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-2 gap-1">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {title.title}
                </h3>
                {title.original_title && title.original_title !== title.title && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{title.original_title}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {hasRating && (
                        <span className="flex items-center gap-1" title={`${rating}/10`}>
                            <Star className="size-3 fill-current text-yellow-500" />
                            {rating.toFixed(1)}
                        </span>
                    )}
                    {title.release_year && (
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {title.release_year}
                        </span>
                    )}
                    <span className="capitalize">{title.type.toLowerCase()}</span>
                </div>
            </div>
        </Link>
    )
}