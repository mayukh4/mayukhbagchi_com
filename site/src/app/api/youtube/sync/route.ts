import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getChannelVideos } from '@/lib/youtube';
import { processVideoUpload } from '../process-video';

export async function GET(req: NextRequest) {
  return handleSync();
}

export async function POST(req: NextRequest) {
  return handleSync();
}

async function handleSync() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: 'YOUTUBE_CHANNEL_ID not configured' }, { status: 500 });
  }

  try {
    console.log('Starting YouTube sync...');
    const sb = supabaseAdmin();
    
    // Get all videos from the channel (last 50)
    const videos = await getChannelVideos(channelId, 50);
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const video of videos) {
      try {
        // Check if video already exists
        const { data: existingPost } = await sb
          .from('video_posts')
          .select('id')
          .eq('youtube_id', video.id)
          .single();
        
        if (existingPost) {
          skipped++;
          continue;
        }
        
        // Process the video
        await processVideoUpload(video.id);
        processed++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        errors++;
      }
    }
    
    console.log(`YouTube sync completed: ${processed} processed, ${skipped} skipped, ${errors} errors`);
    
    return NextResponse.json({
      message: 'YouTube sync completed',
      channelId,
      results: {
        total: videos.length,
        processed,
        skipped,
        errors
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('YouTube sync error:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


