'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { TitleType, TitleStatus, Genre, Tag } from '@/types/database'

interface DiscoverFiltersProps {
    genres: Genre[]
    tags: Tag[]
    onSearch: (params: {
        query?: string
        type?: TitleType
        status?: TitleStatus
        genre_ids?: number[]
        tag_ids?: number[]
        year?: number
    }) => void
}

export function DiscoverFilters({ genres, tags, onSearch }: DiscoverFiltersProps) {
    const [query, setQuery] = useState('')
    const [type, setType] = useState<TitleType | ''>('')
    const [status, setStatus] = useState<TitleStatus | ''>('')
    const [genreIds, setGenreIds] = useState<number[]>([])
    const [tagIds, setTagIds] = useState<number[]>([])
    const [year, setYear] = useState<number | ''>('')

    const hasFilters = type || status || genreIds.length > 0 || tagIds.length > 0 || year

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        onSearch({
            query: query || undefined,
            type: type || undefined,
            status: status || undefined,
            genre_ids: genreIds.length > 0 ? genreIds : undefined,
            tag_ids: tagIds.length > 0 ? tagIds : undefined,
            year: year || undefined,
        })
    }

    function clearFilters() {
        setQuery('')
        setType('')
        setStatus('')
        setGenreIds([])
        setTagIds([])
        setYear('')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search donghua..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button type="submit">Search</Button>
                {hasFilters && (
                    <Button type="button" variant="ghost" size="icon" onClick={clearFilters}>
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-4">
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="TV">TV</SelectItem>
                        <SelectItem value="ONA">ONA</SelectItem>
                        <SelectItem value="Movie">Movie</SelectItem>
                        <SelectItem value="OVA">OVA</SelectItem>
                        <SelectItem value="Special">Special</SelectItem>
                        <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="Airing">Airing</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Hiatus">Hiatus</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    type="number"
                    placeholder="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.valueAsNumber || '')}
                    className="w-[100px]"
                    min={1900}
                    max={new Date().getFullYear() + 2}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('gap-1', genreIds.length > 0 && 'bg-primary/10 text-primary')}>
                            <Filter className="size-4" />
                            Genres
                            <ChevronDown className="size-4" />
                            {genreIds.length > 0 && <span className="text-xs bg-primary/20 text-primary px-1.5 rounded-full">{genreIds.length}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2">
                        {genres.map((genre) => (
                            <label key={genre.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer">
                                <Checkbox
                                    checked={genreIds.includes(genre.id)}
                                    onCheckedChange={(checked) =>
                                        setGenreIds((prev) => checked ? [...prev, genre.id] : prev.filter((id) => id !== genre.id))
                                    }
                                />
                                <span className="text-sm">{genre.name}</span>
                            </label>
                        ))}
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('gap-1', tagIds.length > 0 && 'bg-primary/10 text-primary')}>
                            <Filter className="size-4" />
                            Tags
                            <ChevronDown className="size-4" />
                            {tagIds.length > 0 && <span className="text-xs bg-primary/20 text-primary px-1.5 rounded-full">{tagIds.length}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2">
                        {tags.map((tag) => (
                            <label key={tag.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer">
                                <Checkbox
                                    checked={tagIds.includes(tag.id)}
                                    onCheckedChange={(checked) =>
                                        setTagIds((prev) => checked ? [...prev, tag.id] : prev.filter((id) => id !== tag.id))
                                    }
                                />
                                <span className="text-sm">{tag.name}</span>
                            </label>
                        ))}
                    </PopoverContent>
                </Popover>
            </div>
        </form>
    )
}