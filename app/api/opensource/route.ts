import { NextResponse } from 'next/server';
import opensource from '@/public/data/opensource.json';
import type { OpenSourceRepo } from '@/lib/types';

// Caching is set per response below, so a rate-limited answer isn't cached for hours.
export const dynamic = 'force-dynamic';
const CACHE_OK = 'public, s-maxage=21600, stale-while-revalidate=86400';
const CACHE_MISS = 'public, s-maxage=300';

/** Optional GITHUB_TOKEN raises the limit from 60 to 5,000 requests an hour; public data only either way. */
function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'raj-vivek.com' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers(), cache: 'no-store', signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`http-${res.status}`);
  return res.json() as Promise<T>;
}

type SearchItem = {
  repository_url: string;
  state: 'open' | 'closed';
  updated_at: string;
  pull_request?: { merged_at: string | null };
};
type Repo = {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  private: boolean;
  fork: boolean;
};

/**
 * Public repositories the user opened pull requests against, most recently active first.
 * Found with GitHub's search API (one page of 100 PRs), then enriched with each repo's details. Never throws.
 */
export async function GET() {
  const { githubUser, excludeRepos, excludeOwnRepos, max } = opensource;
  const user = githubUser.toLowerCase();
  const excluded = new Set(excludeRepos.map((r) => r.toLowerCase()));

  let items: SearchItem[];
  try {
    const q = encodeURIComponent(`type:pr author:${githubUser}`);
    ({ items } = await gh<{ items: SearchItem[] }>(
      `https://api.github.com/search/issues?q=${q}&sort=updated&order=desc&per_page=100`,
    ));
  } catch (e) {
    const status = `search-failed: ${e instanceof Error ? e.message : String(e)}`;
    return NextResponse.json({ status, repos: [] }, { headers: { 'Cache-Control': CACHE_MISS } });
  }

  // Search results are newest first, so the first PR seen per repo carries its latest activity.
  const byRepo = new Map<string, { merged: number; open: number; total: number; updatedAt: string }>();
  for (const it of items) {
    const name = it.repository_url.replace('https://api.github.com/repos/', '');
    const key = name.toLowerCase();
    if (excluded.has(key) || (excludeOwnRepos && key.startsWith(`${user}/`))) continue;
    const r = byRepo.get(name) ?? { merged: 0, open: 0, total: 0, updatedAt: it.updated_at };
    r.total++;
    if (it.pull_request?.merged_at) r.merged++;
    else if (it.state === 'open') r.open++;
    byRepo.set(name, r);
  }

  const repos = (
    await Promise.all(
      [...byRepo].slice(0, max).map(async ([name, prs]): Promise<OpenSourceRepo | null> => {
        // A repo that fails to load is still listed, just without its details.
        const repo = await gh<Repo>(`https://api.github.com/repos/${name}`).catch(() => null);
        if (repo?.private) return null;
        return {
          name: repo?.full_name ?? name,
          url: repo?.html_url ?? `https://github.com/${name}`,
          prsUrl: `https://github.com/${name}/pulls?q=${encodeURIComponent(`is:pr author:${githubUser}`)}`,
          description: repo?.description ?? '',
          stars: repo?.stargazers_count ?? 0,
          language: repo?.language ?? '',
          ...prs,
        };
      }),
    )
  ).filter((r): r is OpenSourceRepo => r !== null);

  return NextResponse.json(
    { status: repos.length ? 'ok' : 'no-contributions', repos },
    { headers: { 'Cache-Control': repos.length ? CACHE_OK : CACHE_MISS } },
  );
}
