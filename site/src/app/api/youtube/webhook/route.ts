import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { processVideoUpload } from '../process-video';

export async function GET(request: NextRequest) {
  // Handle YouTube PubSubHubbub subscription verification
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('hub.challenge');
  
  if (challenge) {
    console.log('YouTube webhook verification challenge received');
    return new NextResponse(challenge, { status: 200 });
  }
  
  return new NextResponse('OK', { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Parse the YouTube PubSubHubbub notification
    const videoIdMatch = body.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const channelIdMatch = body.match(/<yt:channelId>([^<]+)<\/yt:channelId>/);
    
    if (!videoIdMatch || !channelIdMatch) {
      console.log('Invalid YouTube webhook payload');
      return new NextResponse('Invalid payload', { status: 400 });
    }
    
    const videoId = videoIdMatch[1];
    const channelId = channelIdMatch[1];
    
    // Verify this is for our channel
    const expectedChannelId = process.env.YOUTUBE_CHANNEL_ID;
    if (channelId !== expectedChannelId) {
      console.log(`Ignoring webhook for different channel: ${channelId}`);
      return new NextResponse('OK', { status: 200 });
    }
    
    console.log(`YouTube webhook received for video: ${videoId}`);
    
    // Store the webhook event
    const sb = supabaseAdmin();
    await sb.from('youtube_webhooks').insert({
      video_id: videoId,
      event_type: 'new',
      raw_payload: body,
      processed: false
    });
    
    // Process the video upload asynchronously
    try {
      await processVideoUpload(videoId);
    } catch (error) {
      console.error('Error processing video upload:', error);
      // Don't fail the webhook - we'll retry later
    }
    
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('YouTube webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
