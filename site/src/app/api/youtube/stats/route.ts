import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getChannelStats } from '@/lib/youtube';

export async function POST() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: 'YOUTUBE_CHANNEL_ID not configured' }, { status: 500 });
  }

  try {
    console.log('Collecting channel stats...');
    
    // Get current stats from YouTube
    const stats = await getChannelStats(channelId);
    
    const sb = supabaseAdmin();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Insert or update today's stats
    const { error } = await sb
      .from('channel_stats')
      .upsert({
        date: today,
        subscribers: parseInt(stats.subscriberCount),
        total_views: parseInt(stats.viewCount),
        video_count: parseInt(stats.videoCount)
      }, {
        onConflict: 'date'
      });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Channel stats updated successfully');
    
    return NextResponse.json({
      message: 'Channel stats updated',
      date: today,
      stats: {
        subscribers: parseInt(stats.subscriberCount),
        totalViews: parseInt(stats.viewCount),
        videoCount: parseInt(stats.videoCount)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats collection error:', error);
    return NextResponse.json({
      error: 'Stats collection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sb = supabaseAdmin();
    
    // Get latest stats
    const { data: latestStats } = await sb
      .from('channel_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(30); // Last 30 days
    
    return NextResponse.json({
      stats: latestStats || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats retrieval error:', error);
    return NextResponse.json({
      error: 'Stats retrieval failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
