-- Enhanced YouTube Automation Schema Migration
-- Run this in your Supabase SQL editor to add the new columns

-- Step 1: Add YouTube metadata columns to video_posts table
ALTER TABLE public.video_posts 
ADD COLUMN IF NOT EXISTS youtube_title text,
ADD COLUMN IF NOT EXISTS youtube_description text,
ADD COLUMN IF NOT EXISTS youtube_thumbnail_url text,
ADD COLUMN IF NOT EXISTS youtube_published_at timestamptz,
ADD COLUMN IF NOT EXISTS youtube_view_count bigint,
ADD COLUMN IF NOT EXISTS youtube_like_count bigint,
ADD COLUMN IF NOT EXISTS youtube_duration text;

-- Step 2: Add SEO metadata columns
ALTER TABLE public.video_posts 
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS seo_keywords text[],
ADD COLUMN IF NOT EXISTS canonical_url text;

-- Step 3: Add processing and metadata columns
ALTER TABLE public.video_posts 
ADD COLUMN IF NOT EXISTS transcript text,
ADD COLUMN IF NOT EXISTS video_length_seconds integer,
ADD COLUMN IF NOT EXISTS processing_status text CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message text;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS video_posts_youtube_id_idx ON public.video_posts(youtube_id);
CREATE INDEX IF NOT EXISTS video_posts_processing_status_idx ON public.video_posts(processing_status);
CREATE INDEX IF NOT EXISTS video_posts_needs_review_idx ON public.video_posts(needs_review) WHERE needs_review = true;

-- Step 5: Create channel_stats table
CREATE TABLE IF NOT EXISTS public.channel_stats (
  id bigserial primary key,
  date date not null unique,
  subscribers bigint,
  total_views bigint,
  video_count bigint,
  created_at timestamptz default now()
);

-- Step 6: Create youtube_webhooks table for tracking webhook events
CREATE TABLE IF NOT EXISTS public.youtube_webhooks (
  id uuid primary key default gen_random_uuid(),
  video_id text,
  event_type text, -- 'new', 'updated', 'deleted'
  raw_payload text,
  processed boolean default false,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS youtube_webhooks_processed_idx ON public.youtube_webhooks(processed, created_at);

-- Step 7: Update RLS policies
ALTER TABLE public.channel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_webhooks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for channel stats (for the public channel stats component)
CREATE POLICY IF NOT EXISTS "Allow anonymous read for channel stats" ON public.channel_stats
  FOR SELECT USING (true);

-- Step 8: Update the video_posts RLS policy to handle new columns
DROP POLICY IF EXISTS "Allow anonymous read for published posts" ON public.video_posts;
CREATE POLICY "Allow anonymous read for published posts" ON public.video_posts
  FOR SELECT USING (status = 'published');

-- Optional: Update existing records with processing_status
UPDATE public.video_posts 
SET processing_status = 'completed' 
WHERE processing_status IS NULL AND status = 'published';

UPDATE public.video_posts 
SET processing_status = 'pending' 
WHERE processing_status IS NULL AND status = 'draft';

-- Verification queries (uncomment to run)
-- SELECT COUNT(*) as total_posts FROM public.video_posts;
-- SELECT processing_status, COUNT(*) FROM public.video_posts GROUP BY processing_status;
-- \d public.video_posts;
