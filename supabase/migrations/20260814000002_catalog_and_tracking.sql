-- Phase 2 + 3: Catalog + User Tracking
-- Run after 20260814000001_initial_schema.sql

-- ============================================
-- Extensions
-- ============================================
create extension if not exists "pg_trgm";  -- for fuzzy search

-- ============================================
-- ENUMs
-- ============================================
create type title_type as enum ('TV', 'ONA', 'Movie', 'OVA', 'Special', 'Short');
create type title_status as enum ('Upcoming', 'Airing', 'Completed', 'Hiatus', 'Cancelled');
create type watch_status as enum ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch');
create type episode_status as enum ('unaired', 'aired', 'delayed', 'cancelled');
create type review_status as enum ('published', 'hidden', 'removed');
create type notification_type as enum ('episode_release', 'watchlist_update', 'review_like', 'system', 'recommendation');
create type report_reason as enum ('spam', 'harassment', 'spoiler', 'hate', 'sexual_content', 'misinformation', 'copyright');

-- ============================================
-- GENRES & TAGS
-- ============================================
create table if not exists public.genres (
    id bigserial primary key,
    name text not null unique,
    slug text not null unique,
    description text,
    created_at timestamptz not null default now()
);

create table if not exists public.tags (
    id bigserial primary key,
    name text not null unique,
    slug text not null unique,
    description text,
    category text, -- e.g., 'theme', 'demographic', 'format'
    created_at timestamptz not null default now()
);

-- ============================================
-- TITLES
-- ============================================
create table if not exists public.titles (
    id bigserial primary key,
    slug text not null unique,
    title text not null,
    original_title text,
    native_title text,
    synonyms text[] default '{}',
    description text,
    cover_url text,
    banner_url text,
    type title_type not null default 'TV',
    status title_status not null default 'Upcoming',
    release_year int,
    start_date date,
    end_date date,
    total_episodes int default 0,
    duration int default 24, -- minutes per episode
    source text, -- e.g., 'tmdb', 'anilist', 'manual'
    source_id text, -- external provider ID
    average_rating numeric(3,2) default 0,
    rating_count int default 0,
    popularity_score numeric(10,2) default 0,
    favorites_count int default 0,
    views_count bigint default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for titles
create index if not exists idx_titles_slug on public.titles (slug);
create index if not exists idx_titles_status on public.titles (status);
create index if not exists idx_titles_release_year on public.titles (release_year);
create index if not exists idx_titles_popularity on public.titles (popularity_score desc);
create index if not exists idx_titles_type on public.titles (type);
create index if not exists idx_titles_airing on public.titles (start_date) where status = 'Airing';
create index if not exists idx_titles_search on public.titles using gin (
    title gin_trgm_ops,
    original_title gin_trgm_ops,
    native_title gin_trgm_ops
);

-- ============================================
-- TITLE_GENRES & TITLE_TAGS (many-to-many)
-- ============================================
create table if not exists public.title_genres (
    title_id bigint not null references public.titles(id) on delete cascade,
    genre_id bigint not null references public.genres(id) on delete cascade,
    primary key (title_id, genre_id)
);

create table if not exists public.title_tags (
    title_id bigint not null references public.titles(id) on delete cascade,
    tag_id bigint not null references public.tags(id) on delete cascade,
    primary key (title_id, tag_id)
);

-- ============================================
-- SEASONS
-- ============================================
create table if not exists public.seasons (
    id bigserial primary key,
    title_id bigint not null references public.titles(id) on delete cascade,
    season_number int not null,
    name text,
    description text,
    poster_url text,
    release_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (title_id, season_number)
);

create index if not exists idx_seasons_title_id on public.seasons (title_id);

-- ============================================
-- EPISODES
-- ============================================
create table if not exists public.episodes (
    id bigserial primary key,
    title_id bigint not null references public.titles(id) on delete cascade,
    season_id bigint references public.seasons(id) on delete set null,
    episode_number int not null,
    absolute_number int,
    title text,
    description text,
    thumbnail_url text,
    air_date date,
    air_time time,
    duration int default 24,
    status episode_status not null default 'unaired',
    external_id text, -- provider's episode ID
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (title_id, episode_number)
);

create index if not exists idx_episodes_title_id on public.episodes (title_id);
create index if not exists idx_episodes_season_id on public.episodes (season_id);
create index if not exists idx_episodes_air_date on public.episodes (air_date);
create index if not exists idx_episodes_status on public.episodes (status);

-- ============================================
-- USER_TITLES (Watchlist)
-- ============================================
create table if not exists public.user_titles (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    title_id bigint not null references public.titles(id) on delete cascade,
    status watch_status not null default 'plan_to_watch',
    score int check (score between 1 and 10),
    started_at date,
    completed_at date,
    notes text,
    rewatch_count int default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, title_id)
);

create index if not exists idx_user_titles_user_id on public.user_titles (user_id);
create index if not exists idx_user_titles_title_id on public.user_titles (title_id);
create index if not exists idx_user_titles_status on public.user_titles (user_id, status);

-- ============================================
-- EPISODE_PROGRESS
-- ============================================
create table if not exists public.episode_progress (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    episode_id bigint not null references public.episodes(id) on delete cascade,
    watched boolean not null default false,
    progress_seconds int not null default 0,
    completed_at timestamptz,
    updated_at timestamptz not null default now(),
    unique (user_id, episode_id)
);

create index if not exists idx_episode_progress_user_id on public.episode_progress (user_id);
create index if not exists idx_episode_progress_episode_id on public.episode_progress (episode_id);

-- ============================================
-- FAVORITES
-- ============================================
create table if not exists public.favorites (
    user_id uuid not null references auth.users(id) on delete cascade,
    title_id bigint not null references public.titles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, title_id)
);

create index if not exists idx_favorites_user_id on public.favorites (user_id);
create index if not exists idx_favorites_title_id on public.favorites (title_id);

-- ============================================
-- RATINGS
-- ============================================
create table if not exists public.ratings (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    title_id bigint not null references public.titles(id) on delete cascade,
    score int not null check (score between 1 and 10),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, title_id)
);

create index if not exists idx_ratings_title_id on public.ratings (title_id);
create index if not exists idx_ratings_user_id on public.ratings (user_id);

-- ============================================
-- REVIEWS
-- ============================================
create table if not exists public.reviews (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    title_id bigint not null references public.titles(id) on delete cascade,
    rating int check (rating between 1 and 10),
    body text not null,
    spoiler boolean not null default false,
    status review_status not null default 'published',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_reviews_title_id on public.reviews (title_id);
create index if not exists idx_reviews_user_id on public.reviews (user_id);
create index if not exists idx_reviews_status on public.reviews (status);

-- ============================================
-- REVIEW_REACTIONS
-- ============================================
create table if not exists public.review_reactions (
    review_id bigint not null references public.reviews(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    reaction text not null check (reaction in ('helpful', 'not_helpful')),
    created_at timestamptz not null default now(),
    primary key (review_id, user_id)
);

create index if not exists idx_review_reactions_review_id on public.review_reactions (review_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table if not exists public.notifications (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    type notification_type not null,
    title text not null,
    message text not null,
    data jsonb,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_read_at on public.notifications (user_id, read_at);
create index if not exists idx_notifications_created_at on public.notifications (created_at desc);

-- ============================================
-- RELEASE_SUBSCRIPTIONS
-- ============================================
create table if not exists public.release_subscriptions (
    user_id uuid not null references auth.users(id) on delete cascade,
    title_id bigint not null references public.titles(id) on delete cascade,
    notify_new_episode boolean not null default true,
    notify_new_season boolean not null default true,
    created_at timestamptz not null default now(),
    primary key (user_id, title_id)
);

create index if not exists idx_release_subscriptions_title_id on public.release_subscriptions (title_id);

-- ============================================
-- REVIEW_REPORTS
-- ============================================
create table if not exists public.review_reports (
    id bigserial primary key,
    review_id bigint not null references public.reviews(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    reason report_reason not null,
    description text,
    status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
    created_at timestamptz not null default now(),
    resolved_at timestamptz
);

create index if not exists idx_review_reports_review_id on public.review_reports (review_id);

-- ============================================
-- STATISTICS VIEW (Personal stats)
-- ============================================
create or replace view public.user_statistics as
select
    ut.user_id,
    count(*) filter (where ut.status = 'completed') as completed_count,
    count(*) filter (where ut.status = 'watching') as watching_count,
    count(*) filter (where ut.status = 'on_hold') as on_hold_count,
    count(*) filter (where ut.status = 'dropped') as dropped_count,
    count(*) filter (where ut.status = 'plan_to_watch') as plan_to_watch_count,
    count(*) as total_titles,
    coalesce(sum(ep.progress_seconds) / 60.0, 0) as minutes_watched,
    coalesce(round(avg(ut.score)::numeric, 2), 0) as average_score,
    (
        select genre_id
        from public.title_genres tg
        join public.user_titles ut2 on ut2.title_id = tg.title_id
        where ut2.user_id = ut.user_id
        group by genre_id
        order by count(*) desc
        limit 1
    ) as favorite_genre_id
from public.user_titles ut
left join public.episode_progress ep on ep.user_id = ut.user_id
group by ut.user_id;

-- ============================================
-- RLS for all tables
-- ============================================
alter table public.genres enable row level security;
alter table public.tags enable row level security;
alter table public.titles enable row level security;
alter table public.title_genres enable row level security;
alter table public.title_tags enable row level security;
alter table public.seasons enable row level security;
alter table public.episodes enable row level security;
alter table public.user_titles enable row level security;
alter table public.episode_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.ratings enable row level security;
alter table public.reviews enable row level security;
alter table public.review_reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.release_subscriptions enable row level security;
alter table public.review_reports enable row level security;

-- ============================================
-- RLS Policies: Catalog (public read, admin write)
-- ============================================
-- Genres/Tags - public read
create policy "genres_public_read" on public.genres for select using (true);
create policy "tags_public_read" on public.tags for select using (true);

-- Titles - public read
create policy "titles_public_read" on public.titles for select using (true);

-- Title_Genres/Title_Tags - public read
create policy "title_genres_public_read" on public.title_genres for select using (true);
create policy "title_tags_public_read" on public.title_tags for select using (true);

-- Seasons - public read
create policy "seasons_public_read" on public.seasons for select using (true);

-- Episodes - public read
create policy "episodes_public_read" on public.episodes for select using (true);

-- ============================================
-- RLS Policies: User data (own only)
-- ============================================
-- user_titles
create policy "user_titles_own_all" on public.user_titles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- episode_progress
create policy "episode_progress_own_all" on public.episode_progress
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites
create policy "favorites_own_all" on public.favorites
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ratings
create policy "ratings_own_all" on public.ratings
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews
create policy "reviews_own_all" on public.reviews
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reviews_public_read" on public.reviews
    for select using (status = 'published');

-- review_reactions
create policy "review_reactions_own_all" on public.review_reactions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notifications
create policy "notifications_own_all" on public.notifications
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- release_subscriptions
create policy "release_subscriptions_own_all" on public.release_subscriptions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- review_reports
create policy "review_reports_own_all" on public.review_reports
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- Admin policies (bypass RLS via service role or is_admin function)
-- ============================================
-- Use the is_admin function from Phase 1 migration
-- Admins can write to catalog tables
create policy "genres_admin_write" on public.genres
    for all using (public.is_admin(auth.uid()));

create policy "tags_admin_write" on public.tags
    for all using (public.is_admin(auth.uid()));

create policy "titles_admin_write" on public.titles
    for all using (public.is_admin(auth.uid()));

create policy "title_genres_admin_write" on public.title_genres
    for all using (public.is_admin(auth.uid()));

create policy "title_tags_admin_write" on public.title_tags
    for all using (public.is_admin(auth.uid()));

create policy "seasons_admin_write" on public.seasons
    for all using (public.is_admin(auth.uid()));

create policy "episodes_admin_write" on public.episodes
    for all using (public.is_admin(auth.uid()));

-- Admins can moderate reviews
create policy "reviews_admin_all" on public.reviews
    for all using (public.is_admin(auth.uid()));

create policy "review_reports_admin_all" on public.review_reports
    for all using (public.is_admin(auth.uid()));

-- ============================================
-- Triggers: updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists titles_updated_at on public.titles;
create trigger titles_updated_at before update on public.titles
    for each row execute function public.handle_updated_at();

drop trigger if exists seasons_updated_at on public.seasons;
create trigger seasons_updated_at before update on public.seasons
    for each row execute function public.handle_updated_at();

drop trigger if exists episodes_updated_at on public.episodes;
create trigger episodes_updated_at before update on public.episodes
    for each row execute function public.handle_updated_at();

drop trigger if exists user_titles_updated_at on public.user_titles;
create trigger user_titles_updated_at before update on public.user_titles
    for each row execute function public.handle_updated_at();

drop trigger if exists episode_progress_updated_at on public.episode_progress;
create trigger episode_progress_updated_at before update on public.episode_progress
    for each row execute function public.handle_updated_at();

drop trigger if exists ratings_updated_at on public.ratings;
create trigger ratings_updated_at before update on public.ratings
    for each row execute function public.handle_updated_at();

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews
    for each row execute function public.handle_updated_at();

-- ============================================
-- Triggers: Rating aggregates on titles
-- ============================================
create or replace function public.update_title_rating_aggregates()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    if (TG_OP = 'INSERT') then
        update public.titles
        set
            rating_count = rating_count + 1,
            average_rating = round(
                (average_rating * (rating_count - 1) + new.score) / rating_count,
                2
            )
        where id = new.title_id;
        return new;
    elsif (TG_OP = 'UPDATE') then
        update public.titles
        set
            average_rating = round(
                (average_rating * rating_count - old.score + new.score) / rating_count,
                2
            )
        where id = new.title_id;
        return new;
    elsif (TG_OP = 'DELETE') then
        update public.titles
        set
            rating_count = rating_count - 1,
            average_rating = case
                when rating_count > 1 then round(
                    (average_rating * rating_count - old.score) / (rating_count - 1),
                    2
                )
                else 0
            end
        where id = old.title_id;
        return old;
    end if;
    return null;
end;
$$;

drop trigger if exists ratings_aggregate on public.ratings;
create trigger ratings_aggregate
    after insert or update or delete on public.ratings
    for each row execute function public.update_title_rating_aggregates();

-- ============================================
-- Triggers: Favorites count on titles
-- ============================================
create or replace function public.update_title_favorites_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    if (TG_OP = 'INSERT') then
        update public.titles set favorites_count = favorites_count + 1 where id = new.title_id;
        return new;
    elsif (TG_OP = 'DELETE') then
        update public.titles set favorites_count = favorites_count - 1 where id = old.title_id;
        return old;
    end if;
    return null;
end;
$$;

drop trigger if exists favorites_count on public.favorites;
create trigger favorites_count
    after insert or delete on public.favorites
    for each row execute function public.update_title_favorites_count();

-- ============================================
-- Triggers: Watchlist status -> auto-add episode progress
-- ============================================
create or replace function public.auto_create_episode_progress()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
    ep_record record;
begin
    -- When user adds title to watchlist with 'watching' status,
    -- create episode_progress rows for all episodes (optional, lazy creation preferred)
    -- This is intentionally a no-op; progress created on-demand when user watches.
    return new;
end;
$$;

-- ============================================
-- Function: Search titles (basic)
-- ============================================
create or replace function public.search_titles(
    p_query text,
    p_type title_type default null,
    p_status title_status default null,
    p_genre_ids bigint[] default null,
    p_tag_ids bigint[] default null,
    p_year int default null,
    p_limit int default 20,
    p_offset int default 0
)
returns table (
    id bigint,
    slug text,
    title text,
    original_title text,
    native_title text,
    type title_type,
    status title_status,
    release_year int,
    cover_url text,
    average_rating numeric,
    rating_count int,
    popularity_score numeric
) language plpgsql security definer set search_path = '' as $$
begin
    return query
    select
        t.id, t.slug, t.title, t.original_title, t.native_title,
        t.type, t.status, t.release_year, t.cover_url,
        t.average_rating, t.rating_count, t.popularity_score
    from public.titles t
    left join public.title_genres tg on tg.title_id = t.id
    left join public.title_tags tt on tt.title_id = t.id
    where
        (p_query is null or t.title ilike '%' || p_query || '%'
            or t.original_title ilike '%' || p_query || '%'
            or t.native_title ilike '%' || p_query || '%'
            or exists (select 1 from unnest(t.synonyms) s where s ilike '%' || p_query || '%'))
        and (p_type is null or t.type = p_type)
        and (p_status is null or t.status = p_status)
        and (p_year is null or t.release_year = p_year)
        and (p_genre_ids is null or tg.genre_id = any(p_genre_ids))
        and (p_tag_ids is null or tt.tag_id = any(p_tag_ids))
    group by t.id
    order by t.popularity_score desc nulls last, t.average_rating desc nulls last
    limit p_limit offset p_offset;
end;
$$;

-- ============================================
-- Function: Get title with relations
-- ============================================
create or replace function public.get_title_with_relations(p_title_id bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
    result jsonb;
begin
    select jsonb_build_object(
        'title', t,
        'genres', coalesce(
            (select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'slug', g.slug))
             from public.genres g
             join public.title_genres tg on tg.genre_id = g.id
             where tg.title_id = t.id),
            '[]'::jsonb
        ),
        'tags', coalesce(
            (select jsonb_agg(jsonb_build_object('id', tg.id, 'name', tg.name, 'slug', tg.slug))
             from public.tags tg
             join public.title_tags tt on tt.tag_id = tg.id
             where tt.title_id = t.id),
            '[]'::jsonb
        ),
        'seasons', coalesce(
            (select jsonb_agg(s order by s.season_number)
             from public.seasons s
             where s.title_id = t.id),
            '[]'::jsonb
        )
    )
    from public.titles t
    where t.id = p_title_id
    into result;
    return result;
end;
$$;