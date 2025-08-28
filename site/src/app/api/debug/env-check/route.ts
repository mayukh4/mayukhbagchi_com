import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    youtube: {
      apiKey: !!process.env.YOUTUBE_API_KEY,
      channelId: !!process.env.YOUTUBE_CHANNEL_ID,
    },
    nextauth: {
      url: !!process.env.NEXTAUTH_URL,
      secret: !!process.env.NEXTAUTH_SECRET,
    },
    gemini: {
      apiKey: !!process.env.GOOGLE_AI_API_KEY,
    },
    optional: {
      siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      slackWebhook: !!process.env.SLACK_WEBHOOK_URL,
      resendApi: !!process.env.RESEND_API_KEY,
      stripe: {
        secret: !!process.env.STRIPE_SECRET_KEY,
        publishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  };

  return NextResponse.json({
    environmentConfigured: envStatus,
    recommendations: [
      'Check SETUP_GUIDE.md for configuration instructions',
      'Create .env.local file in site/ directory',
      'Set up Supabase project and database',
      'Configure YouTube Data API credentials',
      'Check if Supabase project is active (not paused)',
    ],
    currentUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    note: 'The current Supabase URL appears to be from a demo project that may be suspended. Create your own Supabase project for production use.'
  });
}
