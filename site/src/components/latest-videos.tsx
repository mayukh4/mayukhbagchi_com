import { supabaseAnon } from '@/lib/supabase';
import Link from 'next/link';

export default async function LatestVideos({ limit = 9 }: { limit?: number }) {
  const sb = supabaseAnon();
  const { data: posts, error } = await sb.from('video_posts').select('id,title,slug,youtube_id').eq('status','published').order('created_at',{ascending:false}).limit(limit);
  
  // Debug logging
  console.log('LatestVideos - Posts found:', posts?.length || 0);
  console.log('LatestVideos - Error:', error);
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Error loading videos: {error.message}
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


