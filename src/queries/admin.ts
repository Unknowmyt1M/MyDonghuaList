import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase'

export const adminKeys = {
    stats: ['admin', 'stats'] as const,
    users: (params: Record<string, unknown>) => ['admin', 'users', params] as const,
    userDetail: (id: string) => ['admin', 'users', id] as const,
    titles: (params: Record<string, unknown>) => ['admin', 'titles', params] as const,
    genres: ['admin', 'genres'] as const,
    tags: ['admin', 'tags'] as const,
}

// ─── Types ──────────────────────────────────────────────────

export interface AdminStats {
    total_users: number
    total_titles: number
    total_episodes: number
    total_reviews: number
    active_users: number
    new_signups_30d: number
    pending_reports: number
    titles_airing: number
    titles_upcoming: number
}

export interface AdminUser {
    id: string
    username: string
    display_name: string
    email: string
    avatar_url: string | null
    role: string
    created_at: string
    last_sign_in_at: string | null
    titles_tracked: number
}

export interface AdminUserDetail extends AdminUser {
    bio: string | null
    location: string | null
    website: string | null
    is_private: boolean
    updated_at: string
    reviews_count: number
    favorites_count: number
}

export interface AdminTitle {
    id: number
    slug: string
    title: string
    type: string
    status: string
    release_year: number | null
    average_rating: number
    rating_count: number
    favorites_count: number
    popularity_score: number
    created_at: string
    updated_at: string
}

export interface AdminGenre {
    id: number
    name: string
    slug: string
    description: string | null
    title_count: number
    created_at: string
}

export interface AdminTag {
    id: number
    name: string
    slug: string
    description: string | null
    category: string | null
    title_count: number
    created_at: string
}

// ─── Read Hooks ─────────────────────────────────────────────

export function useAdminStats() {
    return useQuery({
        queryKey: adminKeys.stats,
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_admin_stats')
            if (error) throw error
            return (data?.[0] ?? null) as AdminStats | null
        },
    })
}

export function useAdminUsers(params: { search?: string; role?: string; limit?: number; offset?: number } = {}) {
    return useQuery({
        queryKey: adminKeys.users(params),
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_admin_users', {
                p_search: params.search ?? null,
                p_role: params.role ?? null,
                p_limit: params.limit ?? 50,
                p_offset: params.offset ?? 0,
            })
            if (error) throw error
            return (data ?? []) as AdminUser[]
        },
    })
}

export function useAdminUserDetail(userId: string) {
    return useQuery({
        queryKey: adminKeys.userDetail(userId),
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_admin_user_detail', {
                p_user_id: userId,
            })
            if (error) throw error
            return (data?.[0] ?? null) as AdminUserDetail | null
        },
        enabled: !!userId,
    })
}

export function useAdminTitles(params: { search?: string; status?: string; type?: string; limit?: number; offset?: number } = {}) {
    return useQuery({
        queryKey: adminKeys.titles(params),
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_admin_titles', {
                p_search: params.search ?? null,
                p_status: params.status ?? null,
                p_type: params.type ?? null,
                p_limit: params.limit ?? 50,
                p_offset: params.offset ?? 0,
            })
            if (error) throw error
            return (data ?? []) as AdminTitle[]
        },
    })
}

export function useAdminGenres() {
    return useQuery({
        queryKey: adminKeys.genres,
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_admin_genres')
            if (error) throw error
            return (data ?? []) as AdminGenre[]
        },
    })
}

export function useAdminTags() {
    return useQuery({
        queryKey: adminKeys.tags,
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_admin_tags')
            if (error) throw error
            return (data ?? []) as AdminTag[]
        },
    })
}

// ─── Mutation Hooks ─────────────────────────────────────────

export function useAdminUpdateUserRole() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (params: { userId: string; role: string }) => {
            const supabase = getSupabase()
            const { error } = await supabase.rpc('admin_update_user_role', {
                p_user_id: params.userId,
                p_role: params.role,
            })
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.users({}) })
        },
    })
}

export function useAdminUpdateTitle() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (params: {
            titleId: number
            title?: string
            original_title?: string
            native_title?: string
            description?: string
            type?: string
            status?: string
            release_year?: number
            total_episodes?: number
            duration?: number
            source?: string
        }) => {
            const supabase = getSupabase()
            const { error } = await supabase.rpc('admin_update_title', {
                p_title_id: params.titleId,
                p_title: params.title,
                p_original_title: params.original_title,
                p_native_title: params.native_title,
                p_description: params.description,
                p_type: params.type,
                p_status: params.status,
                p_release_year: params.release_year,
                p_total_episodes: params.total_episodes,
                p_duration: params.duration,
                p_source: params.source,
            })
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.titles({}) })
        },
    })
}

export function useAdminCreateGenre() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (genre: { name: string; slug: string; description?: string }) => {
            const supabase = getSupabase()
            const { error } = await supabase.from('genres').insert({
                name: genre.name,
                slug: genre.slug,
                description: genre.description ?? null,
            })
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.genres })
        },
    })
}

export function useAdminDeleteGenre() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (genreId: number) => {
            const supabase = getSupabase()
            const { error } = await supabase.from('genres').delete().eq('id', genreId)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.genres })
        },
    })
}

export function useAdminCreateTag() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (tag: { name: string; slug: string; description?: string; category?: string }) => {
            const supabase = getSupabase()
            const { error } = await supabase.from('tags').insert({
                name: tag.name,
                slug: tag.slug,
                description: tag.description ?? null,
                category: tag.category ?? null,
            })
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.tags })
        },
    })
}

export function useAdminDeleteTag() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (tagId: number) => {
            const supabase = getSupabase()
            const { error } = await supabase.from('tags').delete().eq('id', tagId)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.tags })
        },
    })
}