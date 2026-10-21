/** Helpers shared by the LinkedIn API route and section. */

/**
 * Pulls the owner's own post IDs (newest first) out of a public LinkedIn profile page.
 * Own posts link to /posts/<slug>_…-activity-<id>; posts the owner only liked or commented on use another slug.
 */
export function extractPostIds(html: string, slug: string): string[] {
  const own = new RegExp(`/posts/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_[^"'\\s?]*?-activity-(\\d{15,})`, 'g');
  const ids: string[] = [];
  for (const m of html.matchAll(own)) if (!ids.includes(m[1])) ids.push(m[1]);
  return ids;
}

/**
 * Turns a LinkedIn post link into its official embed URL.
 * Accepts the embed src itself, a link containing a `urn:li:…:<id>`, a /posts/…-activity-<id>-… link, or a bare activity id.
 */
export function toEmbedUrl(url: string): string | null {
  if (url.includes('linkedin.com/embed/')) return url;
  const urn = url.match(/urn:li:(activity|share|ugcPost):(\d+)/);
  if (urn) return `https://www.linkedin.com/embed/feed/update/urn:li:${urn[1]}:${urn[2]}`;
  const activity = url.match(/activity-(\d{15,})/) ?? url.match(/^(\d{15,})$/);
  if (activity) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activity[1]}`;
  return null;
}
