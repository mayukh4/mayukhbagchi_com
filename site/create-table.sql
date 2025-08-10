-- STEP 1: Run this first in your Supabase SQL editor
-- This creates the basic video_posts table that the system needs

CREATE TABLE IF NOT EXISTS public.video_posts (
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

-- Create basic indexes
CREATE INDEX IF NOT EXISTS video_posts_published_idx ON public.video_posts(status, published_at desc);
CREATE INDEX IF NOT EXISTS video_posts_slug_idx ON public.video_posts(slug);

-- Enable RLS
ALTER TABLE public.video_posts ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists and recreate (Supabase doesn't support IF NOT EXISTS for policies)
DROP POLICY IF EXISTS "Allow anonymous read for published posts" ON public.video_posts;

-- Allow anonymous read access for published posts
CREATE POLICY "Allow anonymous read for published posts" ON public.video_posts
  FOR SELECT USING (status = 'published');

-- Check if it worked
SELECT 'video_posts table created successfully' as status;
