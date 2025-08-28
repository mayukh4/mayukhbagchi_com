import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mayukhbagchi.com';
  
  return {
    rules: [
      // Allow all bots to crawl most content
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/research', 
          '/blogs',
          '/blogs/*',
          '/contact',
          '/cv',
          '/outreach',
          '/conference-travel',
          '/sitemap.xml',
          '/manifest.json',
          // Allow static assets
          '/*.jpg',
          '/*.jpeg', 
          '/*.png',
          '/*.webp',
          '/*.svg',
          '/*.gif',
          '/*.css',
          '/*.js',
          '/*.pdf',
          // Allow API routes that are public
          '/api/youtube/*',
          '/api/send-contact',
        ],
        disallow: [
          // Block admin pages completely
          '/admin',
          '/admin/*',
          '/api/admin',
          '/api/admin/*',
          // Block sensitive API routes
          '/api/debug',
          '/api/debug/*',
          // Block Next.js internals
          '/_next/static/',
          '/_next/image/',
          // Block temporary/private files
          '/private',
          '/private/*',
          '/*.json$', // Block JSON files except manifest
          '/uploads/*', // Block user uploads
          // Block development/testing routes
          '/dev',
          '/dev/*',
          '/test',
          '/test/*',
        ],
      },
      // Specific rules for major search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/admin', '/api/admin/*'],
      },
      {
        userAgent: 'Bingbot', 
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/admin', '/api/admin/*'],
      },
      // Block bots that shouldn't index admin areas
      {
        userAgent: ['Twitterbot', 'facebookexternalhit'],
        allow: [
          '/',
          '/about',
          '/research',
          '/blogs',
          '/blogs/*', 
          '/contact',
          '/cv',
          '/outreach',
          '/conference-travel',
        ],
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

