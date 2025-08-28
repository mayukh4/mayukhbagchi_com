import { supabaseAnon } from '@/lib/supabase';
import Link from 'next/link';

export default async function LatestVideos({ limit = 9 }: { limit?: number }) {
  let posts: any[] | null = null;

  try {
    const sb = supabaseAnon();
    const { data, error } = await sb.from('video_posts').select('id,title,slug,youtube_id').eq('status','published').order('created_at',{ascending:false}).limit(limit);
    posts = data;

    // Debug logging
    console.log('LatestVideos - Posts found:', posts?.length || 0);
    console.log('LatestVideos - Error:', error);
    console.log('LatestVideos - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    if (error) {
      console.error('Supabase query error:', error);

      // Check if it's a connection error vs a query error
      if (error.message.includes('fetch') || error.code === 'PGRST301') {
        return (
          <div className="text-center py-8">
            <div className="space-y-4 max-w-md mx-auto">
              <div className="bg-muted/30 rounded-lg p-6 border border-muted/50">
                <h3 className="font-semibold text-lg mb-2">Database Connection Issue</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  Unable to connect to the database. This could be due to:
                </p>
                <div className="space-y-2 text-xs text-foreground/60">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Supabase project is paused or suspended</li>
                    <li>Network connectivity issues</li>
                    <li>Invalid database credentials</li>
                    <li>Missing environment variables</li>
                  </ul>
                </div>
                <div className="flex gap-2 mt-4">
                  <a
                    href="/api/debug/env-check"
                    className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    Check Configuration
                  </a>
                  <a
                    href="/SETUP_GUIDE.md"
                    className="inline-block px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    Setup Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="text-center py-8 text-red-400">
          <div className="space-y-2">
            <p>Error loading videos: {error.message}</p>
            <p className="text-sm text-red-300">Check if environment variables are configured correctly.</p>
          </div>
        </div>
      );
    }
  } catch (connectionError) {
    console.error('Connection error:', connectionError);

    // Check if it's a Cloudflare error (project suspended)
    if (connectionError instanceof Error &&
        (connectionError.message.includes('<!DOCTYPE html>') ||
         connectionError.message.includes('Cloudflare') ||
         connectionError.message.includes('Web server is down'))) {
      return (
        <div className="text-center py-8">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="bg-orange-500/10 rounded-lg p-6 border border-orange-500/30">
              <h3 className="font-semibold text-lg mb-2 text-orange-400">Supabase Project Suspended</h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                The Supabase project appears to be suspended or inactive. This is a demo database
                that's no longer available.
              </p>
              <div className="space-y-2 text-xs text-foreground/60">
                <p>🔧 <strong>To fix this:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Create your own Supabase project</li>
                  <li>Run the database migrations from supabase-schema.sql</li>
                  <li>Update environment variables in .env.local</li>
                  <li>Import your YouTube videos</li>
                </ul>
              </div>
              <div className="flex gap-2 mt-4">
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Create Supabase Project
                </a>
                <a
                  href="/SETUP_GUIDE.md"
                  className="inline-block px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Setup Guide
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="space-y-4 max-w-md mx-auto">
          <div className="bg-muted/30 rounded-lg p-6 border border-muted/50">
            <h3 className="font-semibold text-lg mb-2">Video Content Not Available</h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              The video content requires additional configuration. To display the latest videos here,
              you'll need to set up Supabase database and YouTube API integration.
            </p>
            <div className="space-y-2 text-xs text-foreground/60">
              <p>📋 <strong>Setup Required:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Supabase project and database</li>
                <li>YouTube Data API credentials</li>
                <li>Environment variables configuration</li>
              </ul>
            </div>
            <a
              href="/SETUP_GUIDE.md"
              className="inline-block mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              View Setup Guide
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/70">No published articles yet.</p>
        <p className="text-sm text-foreground/50 mt-2">Articles will appear here once they're published.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((p:any)=> (
        <Link key={p.id} href={`/blogs/${p.slug}`} className="group rounded-2xl overflow-hidden border border-muted/30 hover:border-accent/50 transition-colors bg-[hsl(var(--background)/0.1)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${p.youtube_id}/hqdefault.jpg`} alt={p.title} className="w-full h-36 object-cover" />
          <div className="p-3">
            <div className="font-medium line-clamp-2 group-hover:text-accent">{p.title}</div>
            <div className="text-sm text-accent mt-2">Read More</div>
          </div>
        </Link>
      ))}
    </div>
  );
}


