import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
    
    if (!API_KEY || !CHANNEL_ID) {
      return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 });
    }

    // Get channel statistics
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch channel stats');
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const stats = data.items[0].statistics;
    
    return NextResponse.json({
      subscriberCount: parseInt(stats.subscriberCount || '0'),
      viewCount: parseInt(stats.viewCount || '0'),
      videoCount: parseInt(stats.videoCount || '0'),
    });

  } catch (error) {
    console.error('Error fetching channel stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
