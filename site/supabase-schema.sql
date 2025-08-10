-- Enhanced schema for YouTube automation system
-- Run this in Supabase SQL editor

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
  updated_at timestamptz default now(),
  
  -- YouTube metadata
  youtube_title text,
  youtube_description text,
  youtube_thumbnail_url text,
  youtube_published_at timestamptz,
  youtube_view_count bigint,
  youtube_like_count bigint,
  youtube_duration text,
  
  -- SEO metadata
  seo_title text,
  seo_description text,
  seo_keywords text[],
  canonical_url text,
  
  -- Additional metadata
  transcript text,
  video_length_seconds integer,
  processing_status text check (processing_status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  error_message text
);

create index if not exists video_posts_published_idx on public.video_posts(status, published_at desc);
create index if not exists video_posts_slug_idx on public.video_posts(slug);
create index if not exists video_posts_youtube_id_idx on public.video_posts(youtube_id);
create index if not exists video_posts_processing_status_idx on public.video_posts(processing_status);
create index if not exists video_posts_needs_review_idx on public.video_posts(needs_review) where needs_review = true;

create table if not exists public.channel_stats (
  id bigserial primary key,
  date date not null unique,
  subscribers bigint,
  total_views bigint,
  video_count bigint,
  created_at timestamptz default now()
);

-- Webhook tracking table for YouTube PubSubHubbub
create table if not exists public.youtube_webhooks (
  id uuid primary key default gen_random_uuid(),
  video_id text,
  event_type text, -- 'new', 'updated', 'deleted'
  raw_payload text,
  processed boolean default false,
  created_at timestamptz default now()
);

create index if not exists youtube_webhooks_processed_idx on public.youtube_webhooks(processed, created_at);

-- RLS policies (if needed)
alter table public.video_posts enable row level security;
alter table public.channel_stats enable row level security;
alter table public.youtube_webhooks enable row level security;

-- Allow anonymous read access for published posts
create policy "Allow anonymous read for published posts" on public.video_posts
  for select using (status = 'published');

-- Allow anonymous read access for channel stats
create policy "Allow anonymous read for channel stats" on public.channel_stats
  for select using (true);


