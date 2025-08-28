import { supabaseAnon } from '@/lib/supabase';
import { formatViewCount } from '@/lib/youtube';
import Link from 'next/link';
import type { Metadata } from 'next';
import VLBIBackground from '@/components/vlbi-background';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Astronomy & Astrophysics Blog",
  description: "Explore in-depth articles on astronomy, astrophysics, VLBI instrumentation, black hole imaging, and radio astronomy research by PhD researcher Mayukh Bagchi.",
  keywords: [
    "astronomy blog",
    "astrophysics articles",
    "VLBI research",
    "black hole imaging explained",
    "radio astronomy blog",
    "space science articles",
    "astronomy research blog",
    "PhD astronomy insights",
    "telescope technology",
    "cosmology articles"
  ],
  openGraph: {
    title: "Astronomy & Astrophysics Blog - Mayukh Bagchi | PhD Researcher",
    description: "In-depth articles on astronomy, astrophysics, and space science research. Explore VLBI technology, black hole imaging, and cutting-edge astronomical discoveries.",
    type: "website",
    url: "https://mayukhbagchi.com/blogs",
    images: [
      {
        url: "https://mayukhbagchi.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Astronomy & Astrophysics Blog - Mayukh Bagchi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astronomy & Astrophysics Blog - Mayukh Bagchi",
    description: "In-depth articles on astronomy, astrophysics, and space science research by PhD researcher.",
    images: ["https://mayukhbagchi.com/og-image.jpg"],
    creator: "@mayukh_bagchi",
  },
  alternates: {
    canonical: "https://mayukhbagchi.com/blogs",
  },
};

export default async function BlogsIndex() {
  const sb = supabaseAnon();
  const { data: posts, error } = await sb.from('video_posts')
    .select('id,title,slug,youtube_id,created_at')
    .eq('status','published')
    .order('created_at',{ascending:false})
    .limit(36);

  if (error) {
    console.error('Error fetching blog posts:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <VLBIBackground mode="blogs" hideBlackHole />
      
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Astronomy & Astrophysics Blog</h1>
          <p className="text-lg text-foreground/80 max-w-4xl">
            Dive deep into the fascinating world of astronomy and astrophysics through comprehensive articles covering VLBI instrumentation, 
            black hole imaging, radio astronomy research, and the latest discoveries in space science. Each post combines rigorous scientific 
            content with accessible explanations for fellow researchers and space enthusiasts.
          </p>
        </section>

        {/* Articles Grid */}
        <section>
          {(!posts || posts.length === 0) ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">No Articles Yet</h2>
              <p className="text-foreground/70">Blog articles will appear here once they're published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Research & Learning CTA */}
        <section className="bg-[hsl(var(--background)/0.3)] border border-muted/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Explore Cutting-Edge Astronomy Research</h2>
          <p className="text-foreground/80 mb-6 max-w-3xl mx-auto">
            Stay updated with the latest breakthroughs in astrophysics, VLBI technology, and space science research. 
            These articles bridge the gap between complex scientific concepts and accessible learning for astronomy enthusiasts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/research"
              className="inline-flex items-center gap-2 bg-accent text-background px-6 py-3 rounded-lg font-medium transition-colors hover:bg-accent/90"
            >
              View Research Projects
            </a>
            <a
              href="https://www.youtube.com/@mayukh_bagchi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-3 rounded-lg font-medium transition-colors hover:bg-accent/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch Videos
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function ArticleCard({ post }: { post: any }) {
  const thumbnailUrl = post.hero_image || (post.youtube_id ? `https://i.ytimg.com/vi/${post.youtube_id}/hqdefault.jpg` : '');
  const description = post.seo_description || '';
  const publishedDate = post.youtube_published_at || post.created_at;
  
  return (
    <Link 
      href={`/blogs/${post.slug}`} 
      className="group block rounded-2xl overflow-hidden border border-muted/30 hover:border-accent/50 transition-all hover:-translate-y-2 hover:shadow-xl bg-[hsl(var(--background)/0.1)]"
    >
      {/* Article Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {thumbnailUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={thumbnailUrl} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Read overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 text-black px-4 py-2 rounded-lg font-medium">
                Read Article
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Article Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-accent transition-colors leading-tight">
            {post.title}
          </h3>
          
          {description && (
            <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {/* Article Metadata */}
        <div className="flex items-center justify-between text-xs text-foreground/60 pt-2 border-t border-muted/20">
          <div className="flex items-center gap-4">
            {publishedDate && (
              <span>{new Date(publishedDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            )}
            {post.youtube_view_count && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {formatViewCount(post.youtube_view_count.toString())}
              </span>
            )}
          </div>
          <span className="text-accent font-medium">Read →</span>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted/30 text-foreground/60 rounded text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}



