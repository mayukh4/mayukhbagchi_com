import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('video_posts').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('video_posts').update(body).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}


