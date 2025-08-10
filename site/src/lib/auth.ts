import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'mb_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8h

function sign(payload: object) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-secret';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

function verify(token: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-secret';
  const [body, sig] = token.split('.');
  const expect = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return !!verify(token);
}

export async function createAdminSession() {
  const jar = await cookies();
  const token = sign({ role: 'admin', exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  jar.set({ name: COOKIE_NAME, value: token, httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: MAX_AGE_SECONDS });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}


