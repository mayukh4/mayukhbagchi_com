# Setup Guide for Mayukh Bagchi's Portfolio

## Environment Variables Required

The application requires several environment variables to function properly. Create a `.env.local` file in the root of the `site/` directory with the following variables:

### Required Variables

```env
# Supabase Configuration (Required for video posts and blog functionality)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# YouTube API Configuration (Required for YouTube integration)
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_youtube_channel_id

# NextAuth Configuration (Required for admin authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google AI (Gemini) Configuration (Required for AI content generation)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### Optional Variables

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://mayukhbagchi.com

# Notification Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Setup Steps

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy the project URL and API keys

2. **Set up YouTube API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create API credentials
   - Get your YouTube channel ID from YouTube

3. **Set up Google AI**
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Create .env.local file**
   - Copy the required variables above
   - Fill in your actual values

5. **Run database migrations**
   - Execute the SQL in `supabase-schema.sql` in your Supabase SQL editor

## Common Issues

### "Error loading videos: TypeError: fetch failed"
This error occurs when:
- Missing Supabase environment variables
- Incorrect Supabase URL or keys
- Network connectivity issues

### YouTube Stats Not Loading
This occurs when:
- Missing YouTube API key or channel ID
- YouTube API quota exceeded
- Incorrect channel ID format

### Admin Panel Not Working
This occurs when:
- Missing NextAuth configuration
- Incorrect Supabase service role key

## Testing the Setup

After configuring environment variables, test the following:

1. **Video loading on outreach page**: Should show latest 9 videos in a 3x3 grid
2. **YouTube stats card**: Should display subscriber count and view statistics
3. **Admin authentication**: Should allow login to `/admin` routes

## Architecture Overview

This is a Next.js 15 application with:

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **External APIs**: YouTube Data API, Google AI (Gemini)
- **Authentication**: NextAuth.js with Supabase adapter
- **Styling**: Tailwind CSS with custom components
- **Content**: Markdown-based blog posts with AI-generated content

The application features:
- YouTube video import and processing
- Blog post management with SEO optimization
- Public outreach pages with dynamic content
- Admin dashboard for content management
- Responsive design with dark/light theme support



