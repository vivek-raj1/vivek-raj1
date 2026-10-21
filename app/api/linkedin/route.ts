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

/** `bytes`, `authwall` and `postLinks` are diagnostics: did we get the real page, and did it contain any post links? */
type Attempt = { source: string; status: string; ids: string[]; bytes?: number; authwall?: boolean; postLinks?: number };

/**
 * fetch that follows redirects like a browser: LinkedIn sets a cookie and redirects back to the same URL,
 * which loops forever for a plain server fetch (it drops the cookie).
 */
async function browserFetch(url: string, headers: Record<string, string>): Promise<Response> {
  const jar = new Map<string, string>();
  let current = url;
  for (let hop = 0; hop < 8; hop++) {
    const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    const res = await fetch(current, {
      headers: cookie ? { ...headers, Cookie: cookie } : headers,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';');
      const i = pair.indexOf('=');
      if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString();
      continue;
    }
    return res;
  }
  throw new Error('too many redirects');
}

async function attempt(source: string, url: string, headers: Record<string, string>, slug: string): Promise<Attempt> {
  try {
    const res = await browserFetch(url, headers);
    if (!res.ok) return { source, status: `http-${res.status}`, ids: [] };
    const html = await res.text();
    const ids = extractPostIds(html, slug);
    return {
      source,
      status: ids.length ? 'ok' : 'no-posts-found',
      ids,
      bytes: html.length,
      authwall: /authwall|sign in to view|join linkedin/i.test(html),
      postLinks: (html.match(/\/posts\/|urn:li:activity:/g) ?? []).length,
    };
  } catch (e) {
    return { source, status: `fetch-failed: ${e instanceof Error ? e.message : String(e)}`, ids: [] };
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
    const { ids: _ids, ...summary } = r;
    tried.push(summary);
    if (r.ids.length) {
      return NextResponse.json({ status: 'ok', source: r.source, posts: r.ids.slice(0, autoFetch.max), tried });
    }
  }
  return NextResponse.json({ status: 'no-posts', posts: [], tried });
}
