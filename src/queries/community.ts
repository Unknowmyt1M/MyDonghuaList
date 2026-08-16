import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase'

export const communityKeys = {
    reviews: {
        all: ['community', 'reviews'] as const,
        title: (titleId: number) => ['community', 'reviews', 'title', titleId] as const,
        user: (userId?: string) => ['community', 'reviews', 'user', userId] as const,
    },
    reactions: {
        forReview: (reviewId: string) => ['community', 'reactions', reviewId] as const,
    },
    reports: {
        pending: ['community', 'reports', 'pending'] as const,
    },
}

// ─── Types ──────────────────────────────────────────────────
export interface TitleReview {
    id: string
    rating: number
    body: string
    spoiler: boolean
    status: string
    helpful_count: number
    not_helpful_count: number
    created_at: string
    updated_at: string
    user_id: string
    username: string
    display_name: string
    avatar_url: string | null
    user_reaction: string | null
}

export interface UserReview {
    id: string
    rating: number
    body: string
    spoiler: boolean
    status: string
    helpful_count: number
    created_at: string
    title_id: number
    title_slug: string
    title_name: string
    title_cover_url: string | null
}

export interface ReviewReactionCounts {
    helpful_count: number
    not_helpful_count: number
    user_reaction: string | null
}

export interface PendingReport {
    id: string
    reason: string
    description: string | null
    status: string
    created_at: string
    review_id: string
    review_body: string
    review_rating: number
    review_user_id: string
    review_username: string
    report_user_id: string
    report_username: string
    title_id: number
    title_name: string
}

// ─── Read Hooks ─────────────────────────────────────────────

export function useTitleReviews(titleId: number, sort: string = 'newest', limit: number = 20, offset: number = 0) {
    return useQuery({
        queryKey: communityKeys.reviews.title(titleId),
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_title_reviews', {
                p_title_id: titleId,
                p_sort: sort,
                p_limit: limit,
                p_offset: offset,
            })
            if (error) throw error
            return (data ?? []) as TitleReview[]
        },
        enabled: !!titleId,
    })
}

export function useUserReviews(userId?: string) {
    return useQuery({
        queryKey: communityKeys.reviews.user(userId),
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_user_reviews', {
                p_user_id: userId ?? null,
            })
            if (error) throw error
            return (data ?? []) as UserReview[]
        },
    })
}

export function useReviewReactions(reviewId: string) {
    return useQuery({
        queryKey: communityKeys.reactions.forReview(reviewId),
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_review_reactions', {
                p_review_id: reviewId,
            })
            if (error) throw error
            return (data?.[0] ?? { helpful_count: 0, not_helpful_count: 0, user_reaction: null }) as ReviewReactionCounts
        },
        enabled: !!reviewId,
    })
}

export function usePendingReports() {
    return useQuery({
        queryKey: communityKeys.reports.pending,
        queryFn: async () => {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_pending_review_reports')
            if (error) throw error
            return (data ?? []) as PendingReport[]
        },
    })
}

// ─── Mutation Hooks ─────────────────────────────────────────

export function useCreateReview() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (review: { titleId: number; rating: number; body: string; spoiler: boolean }) => {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    user_id: user.id,
                    title_id: review.titleId,
                    rating: review.rating,
                    body: review.body,
                    spoiler: review.spoiler,
                    status: 'published',
                })
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: communityKeys.reviews.title(variables.titleId) })
        },
    })
}

export function useUpdateReview() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (review: { id: string; titleId: number; rating?: number; body?: string; spoiler?: boolean }) => {
            const supabase = getSupabase()
            const updates: Record<string, unknown> = {}
            if (review.rating !== undefined) updates.rating = review.rating
            if (review.body !== undefined) updates.body = review.body
            if (review.spoiler !== undefined) updates.spoiler = review.spoiler

            const { data, error } = await supabase
                .from('reviews')
                .update(updates)
                .eq('id', review.id)
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: communityKeys.reviews.title(variables.titleId) })
            qc.invalidateQueries({ queryKey: communityKeys.reviews.all })
        },
    })
}

export function useDeleteReview() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (review: { id: string; titleId: number }) => {
            const supabase = getSupabase()
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', review.id)
            if (error) throw error
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: communityKeys.reviews.title(variables.titleId) })
            qc.invalidateQueries({ queryKey: communityKeys.reviews.all })
        },
    })
}

export function useToggleReviewReaction() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (params: { reviewId: string; reaction: 'helpful' | 'not_helpful' }) => {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Check existing reaction
            const { data: existing } = await supabase
                .from('review_reactions')
                .select('id, reaction')
                .eq('review_id', params.reviewId)
                .eq('user_id', user.id)
                .single()

            if (existing) {
                if (existing.reaction === params.reaction) {
                    // Remove reaction (toggle off)
                    const { error } = await supabase
                        .from('review_reactions')
                        .delete()
                        .eq('id', existing.id)
                    if (error) throw error
                    return { action: 'removed' as const }
                } else {
                    // Change reaction
                    const { error } = await supabase
                        .from('review_reactions')
                        .update({ reaction: params.reaction })
                        .eq('id', existing.id)
                    if (error) throw error
                    return { action: 'updated' as const }
                }
            } else {
                // Add new reaction
                const { error } = await supabase
                    .from('review_reactions')
                    .insert({
                        review_id: params.reviewId,
                        user_id: user.id,
                        reaction: params.reaction,
                    })
                if (error) throw error
                return { action: 'created' as const }
            }
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: communityKeys.reactions.forReview(variables.reviewId) })
        },
    })
}

export function useReportReview() {
    return useMutation({
        mutationFn: async (report: { reviewId: string; reason: string; description?: string }) => {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('review_reports')
                .insert({
                    review_id: report.reviewId,
                    user_id: user.id,
                    reason: report.reason,
                    description: report.description ?? null,
                    status: 'pending',
                })
            if (error) throw error
        },
    })
}

// ─── Admin Hooks ────────────────────────────────────────────

export function useAdminModerateReview() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (params: { reviewId: string; status: 'published' | 'hidden' | 'removed' }) => {
            const supabase = getSupabase()
            const { error } = await supabase
                .from('reviews')
                .update({ status: params.status })
                .eq('id', params.reviewId)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: communityKeys.reports.pending })
            qc.invalidateQueries({ queryKey: communityKeys.reviews.all })
        },
    })
}

export function useAdminResolveReport() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (params: { reportId: string; status: 'resolved' | 'dismissed' }) => {
            const supabase = getSupabase()
            const { error } = await supabase
                .from('review_reports')
                .update({
                    status: params.status,
                    resolved_at: new Date().toISOString(),
                })
                .eq('id', params.reportId)
            if (error) throw error
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: communityKeys.reports.pending })
        },
    })
}