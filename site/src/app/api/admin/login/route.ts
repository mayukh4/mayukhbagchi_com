import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  const expected = process.env.ADMIN_PASSWORD || '';
  const ok = expected && password && timingSafeEqual(password, expected);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  await createAdminSession();
  return NextResponse.json({ ok: true });
}

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return Buffer.compare(cryptoSafeHmac(ab), cryptoSafeHmac(bb)) === 0;
}

function cryptoSafeHmac(buf: Buffer) {
  const { createHash } = require('crypto');
  return createHash('sha256').update(buf).digest();
}


