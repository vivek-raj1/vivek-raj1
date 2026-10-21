import { NextResponse } from 'next/server';
import linkedin from '@/public/data/linkedin.json';
import { extractPostIds } from '@/lib/linkedin';

// Re-fetch at most every 6 hours (Vercel caches the response in between).
export const revalidate = 21600;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

type Attempt = { source: string; status: string; ids: string[] };

async function attempt(source: string, url: string, headers: Record<string, string>, slug: string): Promise<Attempt> {
  try {
    const res = await fetch(url, { headers, next: { revalidate }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return { source, status: `http-${res.status}`, ids: [] };
    const ids = extractPostIds(await res.text(), slug);
    return { source, status: ids.length ? 'ok' : 'no-posts-found', ids };
  } catch {
    return { source, status: 'fetch-failed', ids: [] };
  }
}

/**
 * Latest posts from the public LinkedIn profile, as activity ids (newest first).
 * LinkedIn often blocks cloud servers, so a reader service is tried next. Never throws; `tried` shows what happened.
 */
export async function GET() {
  const { autoFetch } = linkedin;
  if (!autoFetch?.enabled) return NextResponse.json({ status: 'disabled', posts: [] });

  const sources: [string, string, Record<string, string>][] = [
    ['linkedin', autoFetch.publicProfileUrl, BROWSER_HEADERS],
    ['reader', `https://r.jina.ai/${autoFetch.publicProfileUrl}`, { Accept: 'text/plain', 'X-Return-Format': 'html' }],
  ];
  const tried: Omit<Attempt, 'ids'>[] = [];
  for (const [source, url, headers] of sources) {
    const r = await attempt(source, url, headers, autoFetch.slug);
    tried.push({ source: r.source, status: r.status });
    if (r.ids.length) {
      return NextResponse.json({ status: 'ok', source: r.source, posts: r.ids.slice(0, autoFetch.max), tried });
    }
  }
  return NextResponse.json({ status: 'no-posts', posts: [], tried });
}
