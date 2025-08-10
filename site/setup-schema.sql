-- Copy and paste this into Supabase SQL Editor and run it once

create extension if not exists pgcrypto;

create table if not exists public.video_posts (
  id uuid primary key default gen_random_uuid(),
  youtube_id text,
  title text,
  slug text unique,
  summary text,
  hero_image text,
  content_md text,
  tags text[] default '{}',
  status text check (status in ('draft','published')) default 'published',
  auto_published boolean default false,
  needs_review boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists video_posts_published_idx on public.video_posts(status, published_at desc);
create index if not exists video_posts_slug_idx on public.video_posts(slug);

create table if not exists public.channel_stats (
  id bigserial primary key,
  date date not null,
  subscribers bigint,
  total_views bigint
);

-- Enable RLS and create read policies
alter table public.video_posts enable row level security;
create policy if not exists published_read on public.video_posts for select using (status = 'published');

alter table public.channel_stats enable row level security;
create policy if not exists public_read on public.channel_stats for select using (true);
