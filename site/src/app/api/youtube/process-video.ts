import { supabaseAdmin } from '@/lib/supabase';
import { getVideoDetails, getVideoTranscript, createSlugFromTitle, parseDuration } from '@/lib/youtube';
import { generateSeoArticle } from '@/lib/gemini';

export async function processVideoUpload(videoId: string) {
  const sb = supabaseAdmin();
  
  try {
    // Check if video already exists
    const { data: existingPost } = await sb
      .from('video_posts')
      .select('id')
      .eq('youtube_id', videoId)
      .single();
    
    if (existingPost) {
      return; // Video already exists, skip processing
    }
    
    // Create initial record with processing status (using only existing columns)
    const { data: newPost, error: insertError } = await sb
      .from('video_posts')
      .insert({
        youtube_id: videoId,
        status: 'draft'
      })
      .select('id')
      .single();
    
    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }
    
    if (!newPost) {
      throw new Error('Failed to create initial video post record');
    }
    
    // Get video details from YouTube API
    const videoDetails = await getVideoDetails(videoId);
    
    // Get transcript (optional)
    let transcript = '';
    try {
      transcript = await getVideoTranscript(videoId);
    } catch (error) {
      // Transcript not available, continue without it
    }
    
    // Generate slug from title
    const slug = createSlugFromTitle(videoDetails.title);
    
    // Generate SEO content using AI
    let contentMd = '';
    let seoTitle = videoDetails.title;
    let seoDescription = videoDetails.description.substring(0, 160);
    
    try {
      contentMd = await generateSeoArticle({
        title: videoDetails.title,
        description: videoDetails.description,
        transcript
      });
      
      // Extract better SEO title and description from generated content
      const titleMatch = contentMd.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        seoTitle = titleMatch[1];
      }
      
      const introMatch = contentMd.match(/^(?:##?\s+[^\n]+\n+)?([^#\n]+(?:\n[^#\n]+)*)/);
      if (introMatch) {
        seoDescription = introMatch[1].trim().substring(0, 160);
      }
    } catch (error) {
      console.warn(`Could not generate SEO content for ${videoId}:`, error);
      contentMd = `# ${videoDetails.title}\n\n${videoDetails.description}\n\n## Watch the Video\n\nCheck out the full video above for a detailed explanation of this topic.`;
    }
    
    // Update the record with available data (using only existing columns)
    const updateData: any = {
      title: videoDetails.title,
      slug,
      summary: videoDetails.description.substring(0, 300),
      hero_image: videoDetails.thumbnail,
      content_md: contentMd,
      status: 'published', // Auto-publish
      auto_published: true,
      needs_review: true,
      published_at: new Date().toISOString()
    };

    // Add extended fields if they exist in the schema
    try {
      // Try to add extended metadata - will fail gracefully if columns don't exist
      const extendedData = {
        ...updateData,
        youtube_title: videoDetails.title,
        youtube_description: videoDetails.description,
        youtube_thumbnail_url: videoDetails.thumbnail,
        youtube_published_at: new Date(videoDetails.publishedAt).toISOString(),
        youtube_view_count: parseInt(videoDetails.viewCount),
        youtube_like_count: parseInt(videoDetails.likeCount),
        youtube_duration: videoDetails.duration,
        transcript,
        video_length_seconds: parseDuration(videoDetails.duration),
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: extractKeywords(videoDetails.title, videoDetails.description),
        canonical_url: `https://mayukhbagchi.com/blogs/${slug}`,
        processing_status: 'completed'
      };
      
      // Test if extended schema is available by trying to update with extended data
      const { error: testError } = await sb
        .from('video_posts')
        .update(extendedData)
        .eq('id', newPost.id);
        
      if (!testError) {
        return; // Success with extended data
      }
    } catch (error) {
      // Extended schema not available, fall back to basic schema
    }
    
    const { error } = await sb
      .from('video_posts')
      .update(updateData)
      .eq('id', newPost.id);
    
    if (error) {
      throw new Error(`Failed to update video post: ${error.message}`);
    }
    
    // Successfully processed video
    
    // Send notification (if configured)
    await sendNotification({
      videoId,
      title: videoDetails.title,
      slug,
      action: 'published'
    });
    
  } catch (error) {
    console.error(`Error processing video ${videoId}:`, error);
    
    // Update error status
    await sb
      .from('video_posts')
      .update({
        processing_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('youtube_id', videoId);
    
    throw error;
  }
}

function extractKeywords(title: string, description: string): string[] {
  // Simple keyword extraction - you could enhance this with NLP
  const text = `${title} ${description}`.toLowerCase();
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 10);
  
  // Add astronomy-specific keywords
  const astronomyKeywords = ['astronomy', 'astrophysics', 'space', 'telescope', 'black hole', 'galaxy', 'star', 'planet', 'universe', 'cosmos', 'vlbi', 'radio astronomy'];
  const relevantKeywords = astronomyKeywords.filter(keyword => 
    text.includes(keyword.toLowerCase())
  );
  
  return [...new Set([...words, ...relevantKeywords])];
}

async function sendNotification({ videoId, title, slug, action }: {
  videoId: string;
  title: string;
  slug: string;
  action: string;
}) {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayukhbagchi.com';
    
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎥 New video ${action}!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${title}*\n\n*Actions:*\n• <${baseUrl}/videos/${slug}|View Post>\n• <${baseUrl}/admin/posts?filter=needsReview|Review & Edit>\n• <https://youtube.com/watch?v=${videoId}|View on YouTube>`
              }
            }
          ]
        })
      });
    }
    
    // You could also send email notifications here using Resend
  } catch (error) {
    console.warn('Failed to send notification:', error);
  }
}
