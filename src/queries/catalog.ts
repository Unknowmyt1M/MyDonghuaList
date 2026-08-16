import { getSupabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
    Title, TitleListItem, Season, Episode, Genre, Tag,
    UserTitle, EpisodeProgress, Favorite, Rating, Review,
    Notification, ReleaseSubscription, UserStatistics,
    SearchTitlesParams, WatchStatus
} from '@/types/database'

const supabase = () => getSupabase().from('titles')

// ============================================
// Query Keys
// ============================================
export const queryKeys = {
    titles: {
        all: ['titles'] as const,
        list: (params: SearchTitlesParams) => ['titles', 'list', params] as const,
        detail: (id: number) => ['titles', 'detail', id] as const,
        trending: (limit?: number) => ['titles', 'trending', limit] as const,
        airing: (limit?: number) => ['titles', 'airing', limit] as const,
        upcoming: (limit?: number) => ['titles', 'upcoming', limit] as const,
    },
    genres: {
        all: ['genres'] as const,
    },
    tags: {
        all: ['tags'] as const,
    },
    seasons: {
        byTitle: (titleId: number) => ['seasons', 'byTitle', titleId] as const,
    },
    episodes: {
        byTitle: (titleId: number) => ['episodes', 'byTitle', titleId] as const,
        bySeason: (seasonId: number) => ['episodes', 'bySeason', seasonId] as const,
    },
    user: {
        watchlist: (status?: WatchStatus) => ['user', 'watchlist', status] as const,
        episodeProgress: (titleId: number) => ['user', 'episodeProgress', titleId] as const,
        favorites: () => ['user', 'favorites'] as const,
        ratings: () => ['user', 'ratings'] as const,
        statistics: () => ['user', 'statistics'] as const,
        notifications: (unreadOnly?: boolean) => ['user', 'notifications', unreadOnly] as const,
        subscriptions: () => ['user', 'subscriptions'] as const,
    },
} as const

// ============================================
// Catalog Queries
// ============================================
export function useSearchTitles(params: SearchTitlesParams) {
    return useQuery({
        queryKey: queryKeys.titles.list(params),
        queryFn: async () => {
            const { data, error } = await getSupabase().rpc('search_titles', {
                p_query: params.query ?? null,
                p_type: params.type ?? null,
                p_status: params.status ?? null,
                p_genre_ids: params.genre_ids ?? null,
                p_tag_ids: params.tag_ids ?? null,
                p_year: params.year ?? null,
                p_limit: params.limit ?? 20,
                p_offset: params.offset ?? 0,
            })
            if (error) throw error
            return data as TitleListItem[]
        },
        placeholderData: (prev) => prev,
    })
}

export function useTitleDetail(id: number) {
    return useQuery({
        queryKey: queryKeys.titles.detail(id),
        queryFn: async () => {
            const { data, error } = await getSupabase().rpc('get_title_with_relations', {
                p_title_id: id,
            })
            if (error) throw error
            return data as Title
        },
        enabled: !!id,
    })
}

export function useTrendingTitles(limit = 10) {
    return useQuery({
        queryKey: queryKeys.titles.trending(limit),
        queryFn: async () => {
            const { data, error } = await supabase()
                .select('id,slug,title,original_title,native_title,type,status,release_year,cover_url,average_rating,rating_count,popularity_score')
                .order('popularity_score', { ascending: false })
                .limit(limit)
            if (error) throw error
            return data as TitleListItem[]
        },
    })
}

export function useAiringTitles(limit = 10) {
    return useQuery({
        queryKey: queryKeys.titles.airing(limit),
        queryFn: async () => {
            const { data, error } = await supabase()
                .select('id,slug,title,original_title,native_title,type,status,release_year,cover_url,average_rating,rating_count,popularity_score')
                .eq('status', 'Airing')
                .order('popularity_score', { ascending: false })
                .limit(limit)
            if (error) throw error
            return data as TitleListItem[]
        },
    })
}

export function useUpcomingTitles(limit = 10) {
    return useQuery({
        queryKey: queryKeys.titles.upcoming(limit),
        queryFn: async () => {
            const { data, error } = await supabase()
                .select('id,slug,title,original_title,native_title,type,status,release_year,cover_url,average_rating,rating_count,popularity_score')
                .eq('status', 'Upcoming')
                .order('release_year', { ascending: true })
                .limit(limit)
            if (error) throw error
            return data as TitleListItem[]
        },
    })
}

export function useGenres() {
    return useQuery({
        queryKey: queryKeys.genres.all,
        queryFn: async () => {
            const { data, error } = await getSupabase().from('genres').select('*').order('name')
            if (error) throw error
            return data as Genre[]
        },
    })
}

export function useTags() {
    return useQuery({
        queryKey: queryKeys.tags.all,
        queryFn: async () => {
            const { data, error } = await getSupabase().from('tags').select('*').order('name')
            if (error) throw error
            return data as Tag[]
        },
    })
}

export function useSeasons(titleId: number) {
    return useQuery({
        queryKey: queryKeys.seasons.byTitle(titleId),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('seasons')
                .select('*')
                .eq('title_id', titleId)
                .order('season_number')
            if (error) throw error
            return data as Season[]
        },
        enabled: !!titleId,
    })
}

export function useEpisodesByTitle(titleId: number) {
    return useQuery({
        queryKey: queryKeys.episodes.byTitle(titleId),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('episodes')
                .select('*')
                .eq('title_id', titleId)
                .order('episode_number')
            if (error) throw error
            return data as Episode[]
        },
        enabled: !!titleId,
    })
}

export function useEpisodesBySeason(seasonId: number) {
    return useQuery({
        queryKey: queryKeys.episodes.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('episodes')
                .select('*')
                .eq('season_id', seasonId)
                .order('episode_number')
            if (error) throw error
            return data as Episode[]
        },
        enabled: !!seasonId,
    })
}

// ============================================
// User Data Queries
// ============================================
export function useWatchlist(status?: WatchStatus) {
    return useQuery({
        queryKey: queryKeys.user.watchlist(status),
        queryFn: async () => {
            let query = getSupabase()
                .from('user_titles')
                .select(`
                    *,
                    title:titles(id,slug,title,original_title,native_title,type,status,release_year,cover_url,average_rating,rating_count)
                `)
            if (status) query = query.eq('status', status)
            const { data, error } = await query.order('updated_at', { ascending: false })
            if (error) throw error
            return data as UserTitle[]
        },
    })
}

export function useEpisodeProgress(titleId: number) {
    return useQuery({
        queryKey: queryKeys.user.episodeProgress(titleId),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('episode_progress')
                .select(`
                    *,
                    episode:episodes(*)
                `)
                .eq('episode.title_id', titleId)
            if (error) throw error
            return data as EpisodeProgress[]
        },
        enabled: !!titleId,
    })
}

export function useFavorites() {
    return useQuery({
        queryKey: queryKeys.user.favorites(),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('favorites')
                .select(`
                    *,
                    title:titles(id,slug,title,original_title,native_title,type,status,release_year,cover_url,average_rating,rating_count)
                `)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as Favorite[]
        },
    })
}

export function useRatings() {
    return useQuery({
        queryKey: queryKeys.user.ratings(),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('ratings')
                .select(`
                    *,
                    title:titles(id,slug,title,original_title,native_title,type,status,release_year,cover_url,average_rating,rating_count)
                `)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as Rating[]
        },
    })
}

export function useUserStatistics() {
    return useQuery({
        queryKey: queryKeys.user.statistics(),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('user_statistics')
                .select('*')
                .single()
            if (error) throw error
            return data as UserStatistics
        },
    })
}

export function useNotifications(unreadOnly = false) {
    return useQuery({
        queryKey: queryKeys.user.notifications(unreadOnly),
        queryFn: async () => {
            let query = getSupabase().from('notifications').select('*').order('created_at', { ascending: false })
            if (unreadOnly) query = query.is('read_at', null)
            const { data, error } = await query
            if (error) throw error
            return data as Notification[]
        },
    })
}

export function useSubscriptions() {
    return useQuery({
        queryKey: queryKeys.user.subscriptions(),
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from('release_subscriptions')
                .select(`
                    *,
                    title:titles(id,slug,title,original_title,native_title,type,status,release_year,cover_url)
                `)
            if (error) throw error
            return data as (ReleaseSubscription & { title: TitleListItem })[]
        },
    })
}

// ============================================
// Recommendations & Analytics
// ============================================

export function useRecommendations(titleId: number, limit: number = 10) {
    return useQuery({
        queryKey: ['recommendations', titleId, limit],
        queryFn: async () => {
            const { data, error } = await getSupabase().rpc('get_recommendations', {
                p_title_id: titleId,
                p_limit: limit,
            })
            if (error) throw error
            return (data ?? []) as { id: number; slug: string; title: string; cover_url: string | null; type: string; status: string; release_year: number | null; average_rating: number; rating_count: number; similarity_score: number }[]
        },
        enabled: !!titleId,
    })
}

export function useSeasonalTitles(year?: number, season?: string) {
    return useQuery({
        queryKey: ['seasonal', year, season],
        queryFn: async () => {
            const { data, error } = await getSupabase().rpc('get_seasonal_titles', {
                p_year: year ?? null,
                p_season: season ?? null,
            })
            if (error) throw error
            return (data ?? []) as (TitleListItem & { season_number: number | null; season_name: string | null })[]
        },
    })
}

// ============================================
// Mutations
// ============================================
export function useAddToWatchlist() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ titleId, status = 'plan_to_watch' as WatchStatus }: { titleId: number; status?: WatchStatus }) => {
            const { data, error } = await getSupabase()
                .from('user_titles')
                .upsert({ title_id: titleId, status }, { onConflict: 'user_id,title_id' })
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.watchlist() })
        },
    })
}

export function useUpdateWatchlistStatus() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ titleId, status, score, notes }: { titleId: number; status: WatchStatus; score?: number; notes?: string }) => {
            const { data, error } = await getSupabase()
                .from('user_titles')
                .update({ status, score, notes, updated_at: new Date().toISOString() })
                .eq('title_id', titleId)
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.watchlist() })
        },
    })
}

export function useRemoveFromWatchlist() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (titleId: number) => {
            const { error } = await getSupabase().from('user_titles').delete().eq('title_id', titleId)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.watchlist() })
        },
    })
}

export function useToggleFavorite() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (titleId: number) => {
            // Check if already favorited
            const { data: existing } = await getSupabase()
                .from('favorites')
                .select('title_id')
                .eq('title_id', titleId)
                .maybeSingle()
            if (existing) {
                const { error } = await getSupabase().from('favorites').delete().eq('title_id', titleId)
                if (error) throw error
                return { favorited: false }
            } else {
                const { error } = await getSupabase().from('favorites').insert({ title_id: titleId })
                if (error) throw error
                return { favorited: true }
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.favorites() })
        },
    })
}

export function useRateTitle() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ titleId, score }: { titleId: number; score: number }) => {
            const { data, error } = await getSupabase()
                .from('ratings')
                .upsert({ title_id: titleId, score }, { onConflict: 'user_id,title_id' })
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.ratings() })
            qc.invalidateQueries({ queryKey: queryKeys.titles.all })
        },
    })
}

export function useUpdateEpisodeProgress() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ episodeId, watched, progressSeconds }: { episodeId: number; watched?: boolean; progressSeconds?: number }) => {
            const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
            if (watched !== undefined) updates.watched = watched
            if (progressSeconds !== undefined) updates.progress_seconds = progressSeconds
            if (watched) updates.completed_at = new Date().toISOString()

            const { data, error } = await getSupabase()
                .from('episode_progress')
                .upsert({ episode_id: episodeId, ...updates }, { onConflict: 'user_id,episode_id' })
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.episodeProgress(0) })
        },
    })
}

export function useMarkNotificationRead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (notificationId: number) => {
            const { error } = await getSupabase()
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notificationId)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.notifications() })
        },
    })
}

export function useMarkAllNotificationsRead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { error } = await getSupabase()
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .is('read_at', null)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.notifications() })
        },
    })
}

export function useToggleSubscription() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ titleId, notifyNewEpisode = true, notifyNewSeason = true }: { titleId: number; notifyNewEpisode?: boolean; notifyNewSeason?: boolean }) => {
            const { data: existing } = await getSupabase()
                .from('release_subscriptions')
                .select('title_id')
                .eq('title_id', titleId)
                .maybeSingle()
            if (existing) {
                const { error } = await getSupabase().from('release_subscriptions').delete().eq('title_id', titleId)
                if (error) throw error
                return { subscribed: false }
            } else {
                const { error } = await getSupabase().from('release_subscriptions').insert({
                    title_id: titleId,
                    notify_new_episode: notifyNewEpisode,
                    notify_new_season: notifyNewSeason,
                })
                if (error) throw error
                return { subscribed: true }
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.user.subscriptions() })
        },
    })
}