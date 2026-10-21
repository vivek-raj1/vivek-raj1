import { NextResponse } from 'next/server';
import linkedin from '@/public/data/linkedin.json';
import { extractPostIds } from '@/lib/linkedin';

// Re-fetch the public profile at most every 6 hours (Vercel caches the response in between).
export const revalidate = 21600;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

/** Latest posts from the public LinkedIn profile, as activity ids. Never throws: `status` explains an empty list. */
export async function GET() {
  const { autoFetch } = linkedin;
  if (!autoFetch?.enabled) return NextResponse.json({ status: 'disabled', posts: [] });
  try {
    const res = await fetch(autoFetch.publicProfileUrl, { headers: HEADERS, next: { revalidate } });
    if (!res.ok) return NextResponse.json({ status: `linkedin-${res.status}`, posts: [] });
    const ids = extractPostIds(await res.text(), autoFetch.slug).slice(0, autoFetch.max);
    return NextResponse.json({ status: ids.length ? 'ok' : 'no-posts-found', posts: ids });
  } catch {
    return NextResponse.json({ status: 'fetch-failed', posts: [] });
  }
}
