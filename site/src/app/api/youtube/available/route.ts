import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getChannelVideos } from '@/lib/youtube';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: 'YOUTUBE_CHANNEL_ID not configured' }, { status: 500 });
  }

  try {
    console.log('Fetching available videos for import...');
    
    // Get all videos from YouTube
    const allVideos = await getChannelVideos(channelId, 50);
    
    // Get already imported videos
    const sb = supabaseAdmin();
    const { data: importedPosts } = await sb
      .from('video_posts')
      .select('youtube_id')
      .not('youtube_id', 'is', null);
    
    const importedVideoIds = new Set(
      (importedPosts || []).map((post: any) => post.youtube_id)
    );
    
    // Filter out already imported videos
    const availableVideos = allVideos.filter(video => 
      !importedVideoIds.has(video.id)
    );
    
    console.log(`Found ${availableVideos.length} videos available for import`);
    
    return NextResponse.json({
      videos: availableVideos,
      total: allVideos.length,
      available: availableVideos.length,
      imported: importedVideoIds.size
    });
    
  } catch (error) {
    console.error('Error fetching available videos:', error);
    return NextResponse.json({
      error: 'Failed to fetch available videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
