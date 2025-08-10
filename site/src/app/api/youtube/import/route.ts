import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { processVideoUpload } from '../process-video';

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    console.log(`Importing single video: ${videoId}`);
    
    // Process the video
    await processVideoUpload(videoId);
    
    return NextResponse.json({
      success: true,
      videoId,
      message: 'Video imported successfully'
    });
    
  } catch (error) {
    console.error('Video import error:', error);
    return NextResponse.json({
      error: 'Failed to import video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
