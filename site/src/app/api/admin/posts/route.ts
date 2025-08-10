import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sb = supabaseAdmin();
    const { data: posts, error } = await sb
      .from('video_posts')
      .select('id,title,slug,status,needs_review,auto_published,created_at,updated_at,youtube_id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Check if it's a missing table error
      if (error.message.includes('table') && error.message.includes('schema cache')) {
        return NextResponse.json(
          { error: 'Database table not found. Please run the database setup.', needsSetup: true },
          { status: 503 }
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json(posts || []);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
