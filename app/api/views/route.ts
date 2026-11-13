import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

// Unique-visitor counter in Upstash Redis (Vercel Marketplace sets KV_* or UPSTASH_* env vars).
// Each visitor's IP is SHA-256 hashed (raw IPs are never stored) and added to a set; the first time
// an IP is seen, the stored total goes up by one. The total is only ever incremented, never reset.
export const dynamic = 'force-dynamic';

const SEEN = 'portfolio:visitors';
const TOTAL = 'portfolio:views';
const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

// Atomic: add the visitor, and bump the total only if they were new. Returns the total.
const VISIT = `if redis.call('SADD', KEYS[1], ARGV[1]) == 1 then return redis.call('INCR', KEYS[2]) end
return tonumber(redis.call('GET', KEYS[2]) or '0')`;

async function redis(cmd: (string | number)[]): Promise<number> {
  const res = await fetch(URL_!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`redis-${res.status}`);
  const { result, error } = (await res.json()) as { result?: unknown; error?: string };
  if (error) throw new Error(error);
  return Number(result ?? 0);
}

function visitorId(req: NextRequest): string | null {
  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return ip ? createHash('sha256').update(`raj-vivek.com:${ip}`).digest('hex') : null;
}

async function handle(cmd: (string | number)[]) {
  if (!URL_ || !TOKEN) return NextResponse.json({ error: 'not-configured' }, { status: 503 });
  try {
    return NextResponse.json({ count: await redis(cmd) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

export const GET = () => handle(['GET', TOTAL]);

export function POST(req: NextRequest) {
  const id = visitorId(req);
  return handle(id ? ['EVAL', VISIT, 2, SEEN, TOTAL, id] : ['GET', TOTAL]);
}
