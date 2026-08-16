-- Phase 6: Analytics & Recommendations

-- ============================================================
-- 1. RPC: get_recommendations - Titles similar to a given title
-- ============================================================
CREATE OR REPLACE FUNCTION get_recommendations(
    p_title_id bigint,
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    cover_url text,
    type title_type,
    status title_status,
    release_year smallint,
    average_rating numeric,
    rating_count integer,
    similarity_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH target_genres AS (
        SELECT tg.genre_id
        FROM title_genres tg
        WHERE tg.title_id = p_title_id
    ),
    target_tags AS (
        SELECT tt.tag_id
        FROM title_tags tt
        WHERE tt.title_id = p_title_id
    ),
    genre_matches AS (
        SELECT t.id, count(*) as genre_count
        FROM titles t
        JOIN title_genres tg ON tg.title_id = t.id
        WHERE tg.genre_id IN (SELECT genre_id FROM target_genres)
          AND t.id != p_title_id
        GROUP BY t.id
    ),
    tag_matches AS (
        SELECT t.id, count(*) as tag_count
        FROM titles t
        JOIN title_tags tt ON tt.title_id = t.id
        WHERE tt.tag_id IN (SELECT tag_id FROM target_tags)
          AND t.id != p_title_id
        GROUP BY t.id
    ),
    combined AS (
        SELECT
            t.id,
            t.slug,
            t.title,
            t.cover_url,
            t.type,
            t.status,
            t.release_year,
            t.average_rating,
            t.rating_count,
            COALESCE(gm.genre_count, 0) * 2 + COALESCE(tm.tag_count, 0) AS score
        FROM titles t
        LEFT JOIN genre_matches gm ON gm.id = t.id
        LEFT JOIN tag_matches tm ON tm.id = t.id
        WHERE COALESCE(gm.genre_count, 0) + COALESCE(tm.tag_count, 0) > 0
    )
    SELECT
        c.id, c.slug, c.title, c.cover_url, c.type, c.status,
        c.release_year, c.average_rating, c.rating_count,
        c.score::numeric AS similarity_score
    FROM combined c
    ORDER BY c.score DESC, c.average_rating DESC
    LIMIT p_limit;
END;
$$;

-- ============================================================
-- 2. RPC: get_trending_titles - Popularity-based ranking
-- ============================================================
CREATE OR REPLACE FUNCTION get_trending_titles(
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    cover_url text,
    type title_type,
    status title_status,
    release_year smallint,
    average_rating numeric,
    rating_count integer,
    favorites_count integer,
    popularity_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id, t.slug, t.title, t.cover_url, t.type, t.status,
        t.release_year, t.average_rating, t.rating_count,
        t.favorites_count, t.popularity_score
    FROM titles t
    WHERE t.status IN ('Airing', 'Completed')
    ORDER BY
        t.popularity_score DESC NULLS LAST,
        t.favorites_count DESC NULLS LAST,
        t.rating_count DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- ============================================================
-- 3. RPC: get_seasonal_titles - Titles grouped by season
-- ============================================================
CREATE OR REPLACE FUNCTION get_seasonal_titles(
    p_year smallint DEFAULT NULL,
    p_season text DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    cover_url text,
    type title_type,
    status title_status,
    release_year smallint,
    average_rating numeric,
    rating_count integer,
    season_number smallint,
    season_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id, t.slug, t.title, t.cover_url, t.type, t.status,
        t.release_year, t.average_rating, t.rating_count,
        s.season_number,
        s.name AS season_name
    FROM titles t
    LEFT JOIN seasons s ON s.title_id = t.id AND s.season_number = 1
    WHERE (p_year IS NULL OR t.release_year = p_year)
      AND t.status IN ('Airing', 'Completed', 'Upcoming')
    ORDER BY t.popularity_score DESC NULLS LAST
    LIMIT 100;
END;
$$;