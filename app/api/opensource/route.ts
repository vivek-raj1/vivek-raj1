import { NextResponse } from 'next/server';
import opensource from '@/public/data/opensource.json';
import type { OpenSourceItem, OpenSourceRepo } from '@/lib/types';

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
  html_url: string;
  number: number;
  title: string;
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
};

/** One search per kind of activity; when a thread matches several, the first role listed here wins. */
function queries(user: string): [OpenSourceItem['role'], string][] {
  return [
    ['author', `type:pr author:${user}`],
    ['author', `type:issue author:${user}`],
    ['reviewer', `type:pr reviewed-by:${user} -author:${user}`],
    ['commenter', `type:pr commenter:${user} -author:${user}`],
    ['commenter', `type:issue commenter:${user} -author:${user}`],
  ];
}

const searchUrl = (q: string) => `https://github.com/search?q=${encodeURIComponent(q)}&type=issues`;

/**
 * Public repositories the user took part in (opened PRs or issues, reviewed, or commented), most recently active first.
 * Found with GitHub's search API (100 results per kind), then enriched with each repo's details. Never throws.
 */
export async function GET() {
  const { githubUser, excludeRepos, excludeOwnRepos, max, maxItemsPerRepo } = opensource;
  const user = githubUser.toLowerCase();
  const excluded = new Set(excludeRepos.map((r) => r.toLowerCase()));

  const results = await Promise.allSettled(
    queries(githubUser).map(([role, q]) =>
      gh<{ items: SearchItem[] }>(
        `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=100`,
      ).then(({ items }) => items.map((it) => ({ it, role }))),
    ),
  );
  // Partial results are still shown; only a total failure is reported as one.
  if (results.every((r) => r.status === 'rejected')) {
    const reason = (results[0] as PromiseRejectedResult).reason;
    const status = `search-failed: ${reason instanceof Error ? reason.message : String(reason)}`;
    return NextResponse.json({ status, repos: [] }, { headers: { 'Cache-Control': CACHE_MISS } });
  }

  const threads = new Map<string, OpenSourceItem & { repo: string }>();
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const { it, role } of r.value) {
      if (threads.has(it.html_url)) continue;
      const repo = it.repository_url.replace('https://api.github.com/repos/', '');
      const key = repo.toLowerCase();
      if (excluded.has(key) || (excludeOwnRepos && key.startsWith(`${user}/`))) continue;
      threads.set(it.html_url, {
        repo,
        title: it.title,
        url: it.html_url,
        number: it.number,
        kind: it.pull_request ? 'pr' : 'issue',
        role,
        state: it.pull_request?.merged_at ? 'merged' : it.state,
        updatedAt: it.updated_at,
      });
    }
  }

  // Newest first, so each repo's first thread is its latest activity and repos come out in that order.
  const byRepo = new Map<string, OpenSourceItem[]>();
  for (const { repo, ...item } of [...threads.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    byRepo.set(repo, [...(byRepo.get(repo) ?? []), item]);
  }

  const repos = (
    await Promise.all(
      [...byRepo].slice(0, max).map(async ([name, items]): Promise<OpenSourceRepo | null> => {
        // A repo that fails to load is still listed, just without its details.
        const repo = await gh<Repo>(`https://api.github.com/repos/${name}`).catch(() => null);
        if (repo?.private) return null;
        const authoredPrs = items.filter((i) => i.kind === 'pr' && i.role === 'author');
        return {
          name: repo?.full_name ?? name,
          url: repo?.html_url ?? `https://github.com/${name}`,
          activityUrl: searchUrl(`repo:${name} involves:${githubUser}`),
          description: repo?.description ?? '',
          stars: repo?.stargazers_count ?? 0,
          language: repo?.language ?? '',
          updatedAt: items[0].updatedAt,
          prs: authoredPrs.length,
          merged: authoredPrs.filter((i) => i.state === 'merged').length,
          issues: items.filter((i) => i.kind === 'issue' && i.role === 'author').length,
          reviews: items.filter((i) => i.role === 'reviewer').length,
          comments: items.filter((i) => i.role === 'commenter').length,
          items: items.slice(0, maxItemsPerRepo),
        };
      }),
    )
  ).filter((r): r is OpenSourceRepo => r !== null);

  return NextResponse.json(
    { status: repos.length ? 'ok' : 'no-contributions', repos },
    { headers: { 'Cache-Control': repos.length ? CACHE_OK : CACHE_MISS } },
  );
}
