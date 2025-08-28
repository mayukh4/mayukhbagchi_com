import { MetadataRoute } from 'next';
import { supabaseAnon } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mayukhbagchi.com';
  
  // Static pages with improved lastModified dates and better priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2024-01-15'), // Last significant update
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // More frequent updates with ongoing research
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cv`,
      lastModified: new Date(),
      changeFrequency: 'monthly', // CV updates regularly
      priority: 0.8,
    },
    {
      url: `${baseUrl}/outreach`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Regular outreach updates
      priority: 0.6,
    },
    {
      url: `${baseUrl}/conference-travel`,
      lastModified: new Date(),
      changeFrequency: 'monthly', // Conference schedule updates
      priority: 0.5,
    },
  ];

  // Dynamic video pages
  try {
    const sb = supabaseAnon();
    const { data: videoPosts } = await sb
      .from('video_posts')
      .select('slug,updated_at,published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const blogPages: MetadataRoute.Sitemap = (videoPosts || []).map((post) => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: 'monthly' as const, // Articles don't change frequently once published
      priority: 0.8,
    }));

    return [...staticPages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}