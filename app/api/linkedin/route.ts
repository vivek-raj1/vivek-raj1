import { NextResponse } from 'next/server';
import linkedin from '@/public/data/linkedin.json';
import { extractPostIds } from '@/lib/linkedin';

// Caching is set per response below, so a blocked fetch isn't cached for hours.
export const dynamic = 'force-dynamic';
const CACHE_OK = 'public, s-maxage=21600, stale-while-revalidate=86400';
const CACHE_MISS = 'public, s-maxage=300';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * LinkedIn answers browsers from servers with 999, but serves the full public profile to link-preview crawlers.
 * It rate-limits per user agent and host, so a few are tried.
 */
const CRAWLER_AGENTS = [
  'Twitterbot/1.0',
  'facebookexternalhit/1.1',
  'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
];

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
      signal: AbortSignal.timeout(8_000),
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
 * Crawler user agents are tried first, then a browser one, then a reader service. Never throws; `tried` shows what happened.
 */
export async function GET() {
  const { autoFetch } = linkedin;
  if (!autoFetch?.enabled) return NextResponse.json({ status: 'disabled', posts: [] });

  const hosts = [autoFetch.publicProfileUrl, `https://www.linkedin.com/in/${autoFetch.slug}`].filter(
    (u, i, all) => all.indexOf(u) === i,
  );
  const sources: [string, string, Record<string, string>][] = [
    ...CRAWLER_AGENTS.flatMap((ua) =>
      hosts.map((u): [string, string, Record<string, string>] => [
        `linkedin (${ua.split(/[/ ]/)[0]}, ${new URL(u).host})`,
        u,
        { 'User-Agent': ua },
      ]),
    ),
    ['linkedin', autoFetch.publicProfileUrl, BROWSER_HEADERS],
    ['reader', `https://r.jina.ai/${autoFetch.publicProfileUrl}`, { Accept: 'text/plain', 'X-Return-Format': 'html' }],
  ];
  const tried: Omit<Attempt, 'ids'>[] = [];
  for (const [source, url, headers] of sources) {
    const r = await attempt(source, url, headers, autoFetch.slug);
    const { ids: _ids, ...summary } = r;
    tried.push(summary);
    if (r.ids.length) {
      return NextResponse.json(
        { status: 'ok', source: r.source, posts: r.ids.slice(0, autoFetch.max), tried },
        { headers: { 'Cache-Control': CACHE_OK } },
      );
    }
  }
  return NextResponse.json({ status: 'no-posts', posts: [], tried }, { headers: { 'Cache-Control': CACHE_MISS } });
}
