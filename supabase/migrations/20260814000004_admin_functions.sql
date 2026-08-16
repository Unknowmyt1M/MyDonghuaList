-- Phase 5: Admin Dashboard - Stats, User Management, Catalog Management, Data Sync

-- ============================================================
-- 1. RPC: get_admin_stats - Dashboard overview stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_users bigint,
    total_titles bigint,
    total_episodes bigint,
    total_reviews bigint,
    active_users bigint,
    new_signups_30d bigint,
    pending_reports bigint,
    titles_airing bigint,
    titles_upcoming bigint
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
        (SELECT count(*) FROM profiles)::bigint,
        (SELECT count(*) FROM titles)::bigint,
        (SELECT count(*) FROM episodes)::bigint,
        (SELECT count(*) FROM reviews WHERE status = 'published')::bigint,
        (SELECT count(*) FROM profiles WHERE updated_at > now() - interval '30 days')::bigint,
        (SELECT count(*) FROM profiles WHERE created_at > now() - interval '30 days')::bigint,
        (SELECT count(*) FROM review_reports WHERE status = 'pending')::bigint,
        (SELECT count(*) FROM titles WHERE status = 'Airing')::bigint,
        (SELECT count(*) FROM titles WHERE status = 'Upcoming')::bigint;
END;
$$;

-- ============================================================
-- 2. RPC: get_admin_users - Paginated user list with roles
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_users(
    p_search text DEFAULT NULL,
    p_role text DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    username text,
    display_name text,
    email text,
    avatar_url text,
    role text,
    created_at timestamptz,
    last_sign_in_at timestamptz,
    titles_tracked bigint
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
        p.id,
        p.username,
        p.display_name,
        au.email::text,
        p.avatar_url,
        COALESCE(ur.role, 'user')::text,
        p.created_at,
        au.last_sign_in_at,
        (SELECT count(*) FROM user_titles ut WHERE ut.user_id = p.id)::bigint
    FROM profiles p
    LEFT JOIN auth.users au ON au.id = p.id
    LEFT JOIN user_roles ur ON ur.user_id = p.id
    WHERE (p_search IS NULL OR p.username ILIKE '%' || p_search || '%' OR p.display_name ILIKE '%' || p_search || '%')
      AND (p_role IS NULL OR COALESCE(ur.role, 'user') = p_role)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- ============================================================
-- 3. RPC: get_admin_user_detail - Single user with full info
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_user_detail(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    username text,
    display_name text,
    email text,
    avatar_url text,
    bio text,
    location text,
    website text,
    is_private boolean,
    role text,
    created_at timestamptz,
    updated_at timestamptz,
    last_sign_in_at timestamptz,
    titles_tracked bigint,
    reviews_count bigint,
    favorites_count bigint
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
        p.id,
        p.username,
        p.display_name,
        au.email::text,
        p.avatar_url,
        p.bio,
        p.location,
        p.website,
        p.is_private,
        COALESCE(ur.role, 'user')::text,
        p.created_at,
        p.updated_at,
        au.last_sign_in_at,
        (SELECT count(*) FROM user_titles ut WHERE ut.user_id = p.id)::bigint,
        (SELECT count(*) FROM reviews r WHERE r.user_id = p.id)::bigint,
        (SELECT count(*) FROM favorites f WHERE f.user_id = p.id)::bigint
    FROM profiles p
    LEFT JOIN auth.users au ON au.id = p.id
    LEFT JOIN user_roles ur ON ur.user_id = p.id
    WHERE p.id = p_user_id;
END;
$$;

-- ============================================================
-- 4. RPC: admin_update_user_role - Change a user's role
-- ============================================================
CREATE OR REPLACE FUNCTION admin_update_user_role(
    p_user_id uuid,
    p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: admin role required';
    END IF;

    IF p_role NOT IN ('user', 'moderator', 'editor', 'admin') THEN
        RAISE EXCEPTION 'Invalid role: %', p_role;
    END IF;

    INSERT INTO user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) DO UPDATE SET role = p_role;
END;
$$;

-- ============================================================
-- 5. RPC: get_admin_titles - Paginated title list
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_titles(
    p_search text DEFAULT NULL,
    p_status text DEFAULT NULL,
    p_type text DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    type title_type,
    status title_status,
    release_year smallint,
    average_rating numeric,
    rating_count integer,
    favorites_count integer,
    popularity_score numeric,
    created_at timestamptz,
    updated_at timestamptz
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
        t.id,
        t.slug,
        t.title,
        t.type,
        t.status,
        t.release_year,
        t.average_rating,
        t.rating_count,
        t.favorites_count,
        t.popularity_score,
        t.created_at,
        t.updated_at
    FROM titles t
    WHERE (p_search IS NULL OR t.title ILIKE '%' || p_search || '%' OR t.original_title ILIKE '%' || p_search || '%')
      AND (p_status IS NULL OR t.status::text = p_status)
      AND (p_type IS NULL OR t.type::text = p_type)
    ORDER BY t.popularity_score DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- ============================================================
-- 6. RPC: admin_update_title - Edit a title's details
-- ============================================================
CREATE OR REPLACE FUNCTION admin_update_title(
    p_title_id bigint,
    p_title text DEFAULT NULL,
    p_original_title text DEFAULT NULL,
    p_native_title text DEFAULT NULL,
    p_description text DEFAULT NULL,
    p_type title_type DEFAULT NULL,
    p_status title_status DEFAULT NULL,
    p_release_year smallint DEFAULT NULL,
    p_total_episodes integer DEFAULT NULL,
    p_duration integer DEFAULT NULL,
    p_source text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: admin role required';
    END IF;

    UPDATE titles SET
        title = COALESCE(p_title, titles.title),
        original_title = COALESCE(p_original_title, titles.original_title),
        native_title = COALESCE(p_native_title, titles.native_title),
        description = COALESCE(p_description, titles.description),
        type = COALESCE(p_type, titles.type),
        status = COALESCE(p_status, titles.status),
        release_year = COALESCE(p_release_year, titles.release_year),
        total_episodes = COALESCE(p_total_episodes, titles.total_episodes),
        duration = COALESCE(p_duration, titles.duration),
        source = COALESCE(p_source, titles.source),
        updated_at = now()
    WHERE id = p_title_id;
END;
$$;

-- ============================================================
-- 7. RPC: get_admin_genres - List all genres with title counts
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_genres()
RETURNS TABLE (
    id bigint,
    name text,
    slug text,
    description text,
    title_count bigint,
    created_at timestamptz
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
        g.id,
        g.name,
        g.slug,
        g.description,
        (SELECT count(*) FROM title_genres tg WHERE tg.genre_id = g.id)::bigint,
        g.created_at
    FROM genres g
    ORDER BY g.name;
END;
$$;

-- ============================================================
-- 8. RPC: get_admin_tags - List all tags with title counts
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_tags()
RETURNS TABLE (
    id bigint,
    name text,
    slug text,
    description text,
    category text,
    title_count bigint,
    created_at timestamptz
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
        t.id,
        t.name,
        t.slug,
        t.description,
        t.category,
        (SELECT count(*) FROM title_tags tt WHERE tt.tag_id = t.id)::bigint,
        t.created_at
    FROM tags t
    ORDER BY t.name;
END;
$$;