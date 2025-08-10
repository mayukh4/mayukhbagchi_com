# YouTube Video to Blog Post Automation - Setup Guide

This system automatically converts your YouTube videos into SEO-rich blog posts with AI-generated content.

## 🚀 What's Been Implemented

### Core Features
- **Real-time Video Detection**: YouTube PubSubHubbub webhook for instant video detection
- **AI Content Generation**: Uses Gemini AI to create SEO-optimized articles from video data
- **Auto-Publishing**: Videos are automatically published with review flags
- **Admin Dashboard**: Complete admin interface for managing posts
- **SEO Optimization**: Rich metadata, JSON-LD structured data, and automatic sitemap updates
- **Channel Statistics**: Tracks subscriber count, views, and growth metrics

### Architecture
- **Frontend**: Enhanced Next.js 15 with React 19
- **Database**: Supabase PostgreSQL with enhanced schema
- **AI**: Google Gemini for content generation
- **YouTube API**: For video metadata and channel statistics
- **Admin Auth**: Secure session-based authentication
- **Notifications**: Slack webhook support for new video alerts

## 📋 Environment Variables Needed

Add these to your `.env.local` file:

```env
# YouTube API (Required)
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id

# AI Content Generation (Required)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Admin Security (Required)
ADMIN_SESSION_SECRET=your_secure_random_string
ADMIN_PASSWORD=your_admin_password

# Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
NOTIFICATION_EMAIL=your@email.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://mayukhbagchi.com
```

## 🔧 Setup Instructions

### 1. Database Setup

Run the enhanced schema in your Supabase SQL editor:

```sql
-- The enhanced schema is in site/supabase-schema.sql
-- It includes all the new fields for YouTube metadata, SEO data, and processing status
```

### 2. YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Get your channel ID from your YouTube channel URL

### 3. Gemini AI Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Generate an API key
3. Add to your environment variables

### 4. YouTube Webhook Setup (Optional but Recommended)

For real-time video detection, set up the YouTube PubSubHubbub webhook:

1. Your webhook endpoint: `https://mayukhbagchi.com/api/youtube/webhook`
2. Subscribe to your channel feed
3. YouTube will send notifications for new videos

### 5. Admin Access

1. Set a secure `ADMIN_SESSION_SECRET` (use a password generator)
2. Set an `ADMIN_PASSWORD` for login
3. Access admin at: `https://mayukhbagchi.com/admin/login`

## 🎯 How It Works

### Automatic Flow
1. **Video Upload**: You upload a video to YouTube
2. **Detection**: Webhook receives notification (or daily sync catches it)
3. **Processing**: System fetches video metadata, transcript, and thumbnail
4. **AI Generation**: Gemini AI creates SEO-optimized article content
5. **Auto-Publish**: Post is published immediately with `needs_review` flag
6. **Notification**: Slack/email notification sent with edit links
7. **Review**: You can review and edit in the admin dashboard

### Manual Management
- **Admin Dashboard**: `/admin` - Manage all posts with filtering
- **Post Editor**: Enhanced editor with content, SEO, and YouTube tabs
- **One-Click Actions**: Publish, unpublish, revert to draft
- **YouTube Sync**: Manual sync button to pull latest videos
- **Channel Stats**: Automatic daily statistics collection

## 📊 Admin Features

### Dashboard (`/admin`)
- Filter by: All, Needs Review, Auto Published, Drafts
- One-click YouTube sync
- Post status indicators
- Processing status tracking

### Post Editor (`/admin/posts/[id]`)
- **Content Tab**: Title, slug, summary, content (Markdown)
- **SEO Tab**: Meta title, description, keywords
- **YouTube Tab**: Video metadata and processing status
- **Live Preview**: Real-time preview with embedded video
- **Status Management**: Publish/unpublish/revert controls

### Features
- **Auto-Generated Content**: AI creates structured articles with H2 sections, key takeaways, FAQs
- **SEO Optimization**: Automatic meta tags, keywords, JSON-LD structured data
- **Error Handling**: Failed processing tracking and retry capability
- **Transcript Integration**: Automatic transcript extraction when available

## 🔄 Content Processing

### What Gets Generated
1. **SEO Title**: Optimized for search engines
2. **Meta Description**: 150-160 character summaries
3. **Article Content**: Structured markdown with:
   - Introduction
   - H2 topic sections
   - Key takeaways (bullet points)
   - FAQ section
   - Call-to-action to watch video
4. **Keywords**: Astronomy-focused keyword extraction
5. **Structured Data**: JSON-LD for rich search results

### Content Quality
- **Factual Focus**: AI prompted to stay factual and educational
- **Your Voice**: Tuned to maintain your academic communication style
- **SEO Best Practices**: Follows astronomy/science content SEO guidelines
- **Astronomy Keywords**: Automatically includes relevant scientific terms

## 🚨 Important Notes

### Review Process
- All auto-published posts have `needs_review: true`
- Review posts at `/admin` (filter by "Needs Review")
- Edit content, SEO metadata, and publish settings
- Remove review flag when satisfied

### Security
- Admin routes require authentication
- Session-based security with HMAC signing
- Environment variables should never be committed

### Performance
- Posts auto-published immediately for SEO benefits
- Background processing for transcript and AI generation
- Failed processing tracked for manual retry

## 🔗 Key URLs

- **Admin Dashboard**: `/admin`
- **Admin Login**: `/admin/login`
- **Videos Index**: `/videos`
- **Manual Sync**: `/api/youtube/sync` (POST)
- **Channel Stats**: `/api/youtube/stats` (POST)
- **Webhook Endpoint**: `/api/youtube/webhook`

## 🎉 Ready to Use!

Your YouTube automation system is now fully implemented and ready to use. Upload a video to test the automation, or use the manual sync in the admin dashboard to import existing videos.

The system will:
1. ✅ Automatically detect new YouTube videos
2. ✅ Generate SEO-optimized blog content
3. ✅ Auto-publish with review flags
4. ✅ Send notifications for review
5. ✅ Provide easy editing tools
6. ✅ Track channel growth statistics
7. ✅ Maintain your site's design consistency

**Pro Tip**: Start with the manual sync to import a few existing videos and test the workflow before relying on the webhook automation.
