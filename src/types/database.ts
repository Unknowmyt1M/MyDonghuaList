// Database types (matching the SQL schema)
// Generated manually - update when migrations change

export type TitleType = 'TV' | 'ONA' | 'Movie' | 'OVA' | 'Special' | 'Short';
export type TitleStatus = 'Upcoming' | 'Airing' | 'Completed' | 'Hiatus' | 'Cancelled';
export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
export type EpisodeStatus = 'unaired' | 'aired' | 'delayed' | 'cancelled';
export type ReviewStatus = 'published' | 'hidden' | 'removed';
export type NotificationType = 'episode_release' | 'watchlist_update' | 'review_like' | 'system' | 'recommendation';
export type ReportReason = 'spam' | 'harassment' | 'spoiler' | 'hate' | 'sexual_content' | 'misinformation' | 'copyright';
export type ReactionType = 'helpful' | 'not_helpful';

export interface Genre {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    created_at: string;
}

export interface Title {
    id: number;
    slug: string;
    title: string;
    original_title: string | null;
    native_title: string | null;
    synonyms: string[];
    description: string | null;
    cover_url: string | null;
    banner_url: string | null;
    type: TitleType;
    status: TitleStatus;
    release_year: number | null;
    start_date: string | null;
    end_date: string | null;
    total_episodes: number;
    duration: number;
    source: string | null;
    source_id: string | null;
    average_rating: number;
    rating_count: number;
    popularity_score: number;
    favorites_count: number;
    views_count: number;
    created_at: string;
    updated_at: string;
    // Relations (joined)
    genres?: Genre[];
    tags?: Tag[];
    seasons?: Season[];
}

export interface TitleListItem {
    id: number;
    slug: string;
    title: string;
    original_title: string | null;
    native_title: string | null;
    type: TitleType;
    status: TitleStatus;
    release_year: number | null;
    cover_url: string | null;
    average_rating: number;
    rating_count: number;
    popularity_score: number;
}

export interface Season {
    id: number;
    title_id: number;
    season_number: number;
    name: string | null;
    description: string | null;
    poster_url: string | null;
    release_date: string | null;
    created_at: string;
    updated_at: string;
    episodes?: Episode[];
}

export interface Episode {
    id: number;
    title_id: number;
    season_id: number | null;
    episode_number: number;
    absolute_number: number | null;
    title: string | null;
    description: string | null;
    thumbnail_url: string | null;
    air_date: string | null;
    air_time: string | null;
    duration: number;
    status: EpisodeStatus;
    external_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserTitle {
    id: number;
    user_id: string;
    title_id: number;
    status: WatchStatus;
    score: number | null;
    started_at: string | null;
    completed_at: string | null;
    notes: string | null;
    rewatch_count: number;
    created_at: string;
    updated_at: string;
    title?: TitleListItem;
}

export interface EpisodeProgress {
    id: number;
    user_id: string;
    episode_id: number;
    watched: boolean;
    progress_seconds: number;
    completed_at: string | null;
    updated_at: string;
    episode?: Episode;
}

export interface Favorite {
    user_id: string;
    title_id: number;
    created_at: string;
    title?: TitleListItem;
}

export interface Rating {
    id: number;
    user_id: string;
    title_id: number;
    score: number;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: number;
    user_id: string;
    title_id: number;
    rating: number | null;
    body: string;
    spoiler: boolean;
    status: ReviewStatus;
    created_at: string;
    updated_at: string;
    user?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
    helpful_count?: number;
    not_helpful_count?: number;
    user_reaction?: ReactionType | null;
}

export interface ReviewReaction {
    review_id: number;
    user_id: string;
    reaction: ReactionType;
    created_at: string;
}

export interface Notification {
    id: number;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    read_at: string | null;
    created_at: string;
}

export interface ReleaseSubscription {
    user_id: string;
    title_id: number;
    notify_new_episode: boolean;
    notify_new_season: boolean;
    created_at: string;
}

export interface ReviewReport {
    id: number;
    review_id: number;
    user_id: string;
    reason: ReportReason;
    description: string | null;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    resolved_at: string | null;
}

export interface UserStatistics {
    user_id: string;
    completed_count: number;
    watching_count: number;
    on_hold_count: number;
    dropped_count: number;
    plan_to_watch_count: number;
    total_titles: number;
    minutes_watched: number;
    average_score: number;
    favorite_genre_id: number | null;
}

// Search params
export interface SearchTitlesParams {
    query?: string;
    type?: TitleType;
    status?: TitleStatus;
    genre_ids?: number[];
    tag_ids?: number[];
    year?: number;
    limit?: number;
    offset?: number;
}