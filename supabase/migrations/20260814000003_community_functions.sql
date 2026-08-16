-- Phase 4: Community - Review reaction aggregates + RPC functions

-- ============================================================
-- 1. Add helpful_count / not_helpful_count columns to reviews
-- ============================================================
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS not_helpful_count integer DEFAULT 0;

-- ============================================================
-- 2. Trigger function: auto-update reaction counts on reviews
-- ============================================================
CREATE OR REPLACE FUNCTION update_review_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_review_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_review_id := OLD.review_id;
    ELSE
        v_review_id := NEW.review_id;
    END IF;

    UPDATE reviews SET
        helpful_count = (
            SELECT count(*) FROM review_reactions
            WHERE review_id = v_review_id AND reaction = 'helpful'
        ),
        not_helpful_count = (
            SELECT count(*) FROM review_reactions
            WHERE review_id = v_review_id AND reaction = 'not_helpful'
        )
    WHERE id = v_review_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_review_reaction_change ON review_reactions;
CREATE TRIGGER on_review_reaction_change
    AFTER INSERT OR UPDATE OR DELETE ON review_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_review_reaction_counts();

-- ============================================================
-- 3. RPC: get_title_reviews - paginated, sorted reviews
-- ============================================================
CREATE OR REPLACE FUNCTION get_title_reviews(
    p_title_id bigint,
    p_sort text DEFAULT 'newest',
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    rating smallint,
    body text,
    spoiler boolean,
    status review_status,
    helpful_count integer,
    not_helpful_count integer,
    created_at timestamptz,
    updated_at timestamptz,
    user_id uuid,
    username text,
    display_name text,
    avatar_url text,
    user_reaction text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.rating,
        r.body,
        r.spoiler,
        r.status,
        r.helpful_count,
        r.not_helpful_count,
        r.created_at,
        r.updated_at,
        r.user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        COALESCE(
            (SELECT rr.reaction FROM review_reactions rr WHERE rr.review_id = r.id AND rr.user_id = v_user_id),
            NULL
        )::text AS user_reaction
    FROM reviews r
    JOIN profiles p ON p.id = r.user_id
    WHERE r.title_id = p_title_id
      AND r.status = 'published'
    ORDER BY
        CASE WHEN p_sort = 'newest' THEN r.created_at END DESC NULLS LAST,
        CASE WHEN p_sort = 'oldest' THEN r.created_at END ASC NULLS LAST,
        CASE WHEN p_sort = 'highest' THEN r.rating END DESC NULLS LAST,
        CASE WHEN p_sort = 'lowest' THEN r.rating END ASC NULLS LAST,
        CASE WHEN p_sort = 'helpful' THEN r.helpful_count END DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- ============================================================
-- 4. RPC: get_user_reviews - fetch a user's own reviews
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_reviews(
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    rating smallint,
    body text,
    spoiler boolean,
    status review_status,
    helpful_count integer,
    created_at timestamptz,
    title_id bigint,
    title_slug text,
    title_name text,
    title_cover_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user uuid := COALESCE(p_user_id, auth.uid());
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.rating,
        r.body,
        r.spoiler,
        r.status,
        r.helpful_count,
        r.created_at,
        r.title_id,
        t.slug AS title_slug,
        t.title AS title_name,
        t.cover_url AS title_cover_url
    FROM reviews r
    JOIN titles t ON t.id = r.title_id
    WHERE r.user_id = v_user
      AND r.status = 'published'
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================
-- 5. RPC: get_review_reactions - counts for a review
-- ============================================================
CREATE OR REPLACE FUNCTION get_review_reactions(p_review_id uuid)
RETURNS TABLE (
    helpful_count bigint,
    not_helpful_count bigint,
    user_reaction text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM review_reactions WHERE review_id = p_review_id AND reaction = 'helpful'),
        (SELECT count(*) FROM review_reactions WHERE review_id = p_review_id AND reaction = 'not_helpful'),
        COALESCE(
            (SELECT reaction::text FROM review_reactions WHERE review_id = p_review_id AND user_id = v_user_id),
            NULL
        );
END;
$$;

-- ============================================================
-- 6. RPC: get_pending_review_reports (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION get_pending_review_reports()
RETURNS TABLE (
    id uuid,
    reason report_reason,
    description text,
    status text,
    created_at timestamptz,
    review_id uuid,
    review_body text,
    review_rating smallint,
    review_user_id uuid,
    review_username text,
    report_user_id uuid,
    report_username text,
    title_id bigint,
    title_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: admin role required';
    END IF;

    RETURN QUERY
    SELECT
        rr.id,
        rr.reason,
        rr.description,
        rr.status::text,
        rr.created_at,
        rr.review_id,
        r.body AS review_body,
        r.rating AS review_rating,
        r.user_id AS review_user_id,
        rp.username AS review_username,
        rr.user_id AS report_user_id,
        rrp.username AS report_username,
        r.title_id,
        t.title AS title_name
    FROM review_reports rr
    JOIN reviews r ON r.id = rr.review_id
    JOIN profiles rp ON rp.id = r.user_id
    JOIN profiles rrp ON rrp.id = rr.user_id
    JOIN titles t ON t.id = r.title_id
    WHERE rr.status = 'pending'
    ORDER BY rr.created_at ASC;
END;
$$;