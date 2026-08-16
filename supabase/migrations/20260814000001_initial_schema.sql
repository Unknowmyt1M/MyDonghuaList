-- Phase 1: Foundation - profiles, user_roles, RLS, auth trigger
-- Run this in Supabase SQL Editor or via `supabase db push`

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- profiles table
-- ============================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    display_name text,
    bio text,
    avatar_url text,
    banner_url text,
    location text,
    website text,
    is_private boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Username constraints
alter table public.profiles
    add constraint profiles_username_length check (char_length(username) between 3 and 30),
    add constraint profiles_username_format check (username ~ '^[a-zA-Z0-9_]+$');

-- Index for username lookups
create index if not exists idx_profiles_username on public.profiles (username);

-- ============================================
-- user_roles table
-- ============================================
create table if not exists public.user_roles (
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'moderator', 'editor', 'admin')),
    created_at timestamptz not null default now(),
    primary key (user_id, role)
);

create index if not exists idx_user_roles_user_id on public.user_roles (user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- profiles policies
create policy "profiles_select_own" on public.profiles
    for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
    for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
    for delete using (auth.uid() = id);

-- Public profile visibility (non-private profiles can be seen by anyone)
create policy "profiles_select_public" on public.profiles
    for select using (not is_private);

-- user_roles policies (read own roles, admins can manage)
create policy "user_roles_select_own" on public.user_roles
    for select using (auth.uid() = user_id);

-- Function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean language sql security definer set search_path = '' as $$
    select exists (
        select 1 from public.user_roles
        where user_id = is_admin.user_id and role = 'admin'
    );
$$;

-- Admins can manage all roles
create policy "user_roles_admin_all" on public.user_roles
    for all using (public.is_admin(auth.uid()));

-- ============================================
-- Trigger: auto-create profile on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.profiles (id, username, display_name)
    values (
        new.id,
        -- Generate username from email prefix + random suffix if needed
        lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
        || '_' || substr(md5(random()::text), 1, 6),
        split_part(new.email, '@', 1)
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================
-- Updated_at trigger for profiles
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
    before update on public.profiles
    for each row execute function public.handle_updated_at();

-- ============================================
-- Helper: assign default 'user' role on signup
-- ============================================
create or replace function public.assign_default_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.user_roles (user_id, role)
    values (new.id, 'user')
    on conflict (user_id, role) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_role on auth.users;
create trigger on_auth_user_role
    after insert on auth.users
    for each row execute function public.assign_default_role();