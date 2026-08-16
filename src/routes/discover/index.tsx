import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { TitleCard } from '@/components/donghua/title-card'
import { TitleCardSkeleton } from '@/components/donghua/title-card-skeleton'
import { DiscoverFilters } from '@/components/donghua/discover-filters'
import { useSearchTitles, useGenres, useTags } from '@/queries'
import type { TitleListItem, TitleType, TitleStatus } from '@/types/database'

export const Route = createFileRoute('/discover/')({
    component: DiscoverPage,
})

function DiscoverPage() {
    const [searchParams, setSearchParams] = useState<{
        query?: string
        type?: TitleType
        status?: TitleStatus
        genre_ids?: number[]
        tag_ids?: number[]
        year?: number
    }>({})
    const [page, setPage] = useState(0)
    const limit = 24

    const { data: genres } = useGenres()
    const { data: tags } = useTags()

    const { data: titles, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useSearchTitles({
        ...searchParams,
        limit,
        offset: page * limit,
    })

    const allTitles = titles?.flat() ?? []

    function handleSearch(params: typeof searchParams) {
        setSearchParams(params)
        setPage(0)
    }

    function loadMore() {
        if (!isFetchingNextPage && hasNextPage) {
            setPage((p) => p + 1)
        }
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Discover</h1>
                    <p className="text-muted-foreground">Browse and filter the full donghua catalog</p>
                </div>
            </div>

            <DiscoverFilters
                genres={genres ?? []}
                tags={tags ?? []}
                onSearch={handleSearch}
            />

            <div className="mt-6">
                {allTitles.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-6xl mb-4">����</div>
                        <h3 className="text-lg font-medium mb-2">No titles found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {isLoading ? (
                                Array.from({ length: 12 }).map((_, i) => (
                                    <TitleCardSkeleton key={i} />
                                ))
                            ) : (
                                allTitles.map((title) => (
                                    <TitleCard key={title.id} title={title} />
                                ))
                            )}
                        </div>

                        {(isFetchingNextPage || hasNextPage) && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={loadMore}
                                    disabled={isFetchingNextPage}
                                    className="flex items-center gap-2 px-6 py-2 border rounded-lg hover:bg-accent disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load more'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}