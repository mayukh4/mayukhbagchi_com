import { supabaseAnon } from '@/lib/supabase';
import type { Metadata } from 'next';
import { formatViewCount } from '@/lib/youtube';
import ReactMarkdown from 'react-markdown';

type Params = { params: { slug: string } };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const sb = supabaseAnon();
  const { data } = await sb
    .from('video_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!data) {
    return {
      title: 'Article Not Found',
      description: "This article could not be found.",
      robots: { index: false, follow: false },
      alternates: { canonical: `https://mayukhbagchi.com/blogs/${slug}` }
    };
  }

  const title = (data as any).seo_title || data.title || 'Article';
  const description = (data as any).seo_description || undefined;
  const keywords = ((data as any).seo_keywords || []).concat(['Mayukh Bagchi','astronomy','astrophysics','space']);
  const image = (data as any).hero_image;
  const canonical = `https://mayukhbagchi.com/blogs/${slug}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      publishedTime: (data as any).published_at || undefined,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
      siteName: 'Mayukh Bagchi - Astronomy Research',
      authors: ['Mayukh Bagchi']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function VideoPost({ params }: Params) {
  const { slug } = await params;
  const sb = supabaseAnon();
  const { data: post } = await sb
    .from('video_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (!post) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold mb-4">Video Not Found</h1>
        <p className="text-foreground/70">The video you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Generate structured data: VideoObject if YouTube present, otherwise Article
  const isVideo = Boolean(post.youtube_id);
  const structuredData = isVideo ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": post.title,
    "description": post.summary || post.seo_description,
    "thumbnailUrl": post.hero_image || (post.youtube_id ? `https://i.ytimg.com/vi/${post.youtube_id}/maxresdefault.jpg` : undefined),
    "uploadDate": post.youtube_published_at || post.published_at,
    "duration": post.video_length_seconds ? `PT${post.video_length_seconds}S` : undefined,
    "embedUrl": post.youtube_id ? `https://www.youtube.com/embed/${post.youtube_id}` : undefined,
    "contentUrl": post.youtube_id ? `https://www.youtube.com/watch?v=${post.youtube_id}` : undefined,
    "author": { "@type": "Person", "name": "Mayukh Bagchi", "url": "https://mayukhbagchi.com" },
    "publisher": { "@type": "Organization", "name": "Mayukh Bagchi - Astronomy Research", "url": "https://mayukhbagchi.com", "logo": { "@type": "ImageObject", "url": "https://mayukhbagchi.com/logo.png" } },
    "keywords": post.seo_keywords?.join(', ') || '',
    "interactionStatistic": post.youtube_view_count ? { "@type": "InteractionCounter", "interactionType": "http://schema.org/WatchAction", "userInteractionCount": post.youtube_view_count } : undefined
  } : {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "datePublished": post.published_at || post.created_at,
    "image": post.hero_image ? [post.hero_image] : undefined,
    "author": { "@type": "Person", "name": "Mayukh Bagchi" },
    "publisher": { "@type": "Organization", "name": "Mayukh Bagchi - Astronomy Research", "logo": { "@type": "ImageObject", "url": "https://mayukhbagchi.com/logo.png" } },
    "keywords": post.seo_keywords?.join(', ') || ''
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <article className="space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{post.title}</h1>
          
          {post.summary && (
            <p className="text-lg text-foreground/80 leading-relaxed max-w-4xl">{post.summary}</p>
          )}
          
          {/* Video metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
            {post.youtube_published_at && (
              <span>Published: {new Date(post.youtube_published_at).toLocaleDateString()}</span>
            )}
            {post.youtube_view_count && (
              <span>{formatViewCount(post.youtube_view_count.toString())}</span>
            )}
            {post.video_length_seconds && (
              <span>Duration: {formatDuration(post.video_length_seconds)}</span>
            )}
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-muted/30 text-foreground/80 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        {/* Video Embed */}
        {post.youtube_id && (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-muted/30 shadow-lg">
            <iframe 
              className="w-full h-full" 
              src={`https://www.youtube.com/embed/${post.youtube_id}?rel=0`} 
              title={post.title} 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen 
            />
          </div>
        )}
        
        {/* Article Content */}
        {post.content_md && (
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer markdown={post.content_md} />
          </div>
        )}
        
        {/* Back to Blog & Related Articles */}
        <div className="pt-8 border-t border-muted/30 space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <a 
              href="/blogs" 
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              ← Back to all articles
            </a>
            {post.youtube_id && (
              <a 
                href={`https://www.youtube.com/watch?v=${post.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground/70 hover:text-accent hover:underline"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
            )}
          </div>
        </div>
      </article>
    </>
  );
}

function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      components={{
        img: ({ src, alt, ...props }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || ''}
            className="w-full max-w-4xl mx-auto rounded-lg shadow-lg my-8"
            {...props}
          />
        ),
        h1: ({ children, ...props }) => (
          <h1 className="text-3xl font-semibold mt-12 mb-8 text-foreground" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="text-2xl font-semibold mt-10 mb-6 text-foreground" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground" {...props}>
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p className="mb-4 leading-relaxed text-foreground/90" {...props}>
            {children}
          </p>
        ),
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-foreground" {...props}>
            {children}
          </strong>
        ),
        em: ({ children, ...props }) => (
          <em className="italic text-foreground/80" {...props}>
            {children}
          </em>
        ),
        code: ({ children, ...props }) => (
          <code className="bg-muted/30 px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
            {children}
          </code>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside space-y-2 my-4 text-foreground/90" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside space-y-2 my-4 text-foreground/90" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="mb-2" {...props}>
            {children}
          </li>
        ),
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            className="text-accent hover:text-accent/80 underline"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props}
          >
            {children}
          </a>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-4 border-accent/50 pl-4 my-6 italic text-foreground/80" {...props}>
            {children}
          </blockquote>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
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


