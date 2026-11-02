# Session context (Vivek-Raj-Portfolio)

## Skills section (latest)

- **Data-driven**: Categories and skill cards load only from `public/data/skills.json`. Every skill row has a stable **`id`** (add new rows under `categories[].items`; UI maps them automatically).
- **Framer Motion**: Section uses `motion.section`, staggered category pills (`StaggerGroup` + `motion.div` wrappers), list **stagger** via `variants` on `motion.ul` / `motion.li`, `AnimatePresence` on filter changes, spring motion on cards (tilt, dial, hover orbs). **`key={active}`** on the grid so changing the filter re-runs the enter animation cleanly.
- **Variable card heights**: Grid uses **`auto-rows-min`**, **`items-start`**, **`self-start`** on cards so different content heights do not stretch the row unnaturally.
- **Removed “DevOps console” types**: Dropped optional `toolbox` / `ToolboxCardData` from `lib/types.ts` (no interactive copy/link/scroll cards in UI). Extend skills only via **`categories[].items`**.

## Open source section, nav photo and SEO (latest)

- **Open source scales**: `/api/opensource` reads every search page (up to `maxPages` per kind), returns all repos (up to `max`) and every thread, and fetches repo details 10 at a time. The UI pages in more: repo cards `pageSize` at a time with "Show more", each card expands past `maxItemsPerRepo`, and a **History** view lists every thread by the date it was opened, grouped by month (`historyPageSize` per step). Filters: All / Merged / In review / Issues & reviews.
- **Nav**: "Open Source" item added (`meta.json` → `nav.items`). The desktop nav now starts at `lg` (it overflowed at tablet widths with 8 items); below that the menu button is used. The logo shows `person.avatar` (`public/avatar.jpg`), falling back to the `VR` monogram.
- **Icons**: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` are cropped from `public/image.jpg`; `public/favicon.svg` was removed.
- **SEO**: `metadataBase`, canonical URL, robots/googleBot meta, Open Graph `profile` + Twitter card with `public/og.png` (1200×630), schema.org `Person` + `WebSite` JSON-LD, `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, and the name in the hero `<h1>` (screen-reader only). Set `site.googleVerification` in `meta.json` to emit the Search Console tag.
- **GitHub rate limit**: without `GITHUB_TOKEN` the API gets 60 requests an hour, shared by everyone on the server's IP; repo details (stars, language) are then missing and the stars tile hides. Set `GITHUB_TOKEN` in Vercel.

## Done this session (Vercel deploy fix)

- **Root cause**: Next.js **16** static export (`output: 'export'`) no longer writes **`out/routes-manifest.json`**, but Vercel’s Next.js build hook still looked for it when **`outputDirectory` was `out`** in `vercel.json` (or the same override in the Vercel project UI).
- **Fix**: Removed static export from `next.config.js` and removed **`outputDirectory`** from `vercel.json` so Vercel uses the default **`.next`** output and the standard Next.js deploy path.
- **GitHub Actions**: `.github/workflows/vercel-production.yml` now runs `vercel deploy` **without** the `out` argument (remote build / project deploy), after a local `npm run build` as a verify step.

## Done (GitHub Actions Node deprecation)

- **`actions/checkout@v6`** and **`actions/setup-node@v6`** replace v4 so action JS runtimes align with the Node **24** migration ([GitHub changelog](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)).
- Workflow **`node-version: '24'`** for install/build; **`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`** in `env` so any remaining JS actions use Node 24 early.

## Pending / your follow-ups

- **Vercel dashboard**: Open **Project → Settings → General** and ensure **Output Directory** is **empty** (default). If it was manually set to `out`, clear it so it matches the repo.
- **Vercel secrets** (only if using the GitHub workflow): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — or remove the workflow if you rely only on Vercel Git integration.
- **Double deploy risk**: If the repo is connected in Vercel **and** the workflow is enabled, disable one to avoid two production builds per push.
- **Hero WebGL**: `HeroThreeCanvas` is currently a placeholder — add a Three.js scene when ready; `three` is already a dependency.
- **Optional**: Pin `vercel` in `devDependencies` for identical CLI behavior in CI.

## Verify locally

- `npm run build` (writes **`.next/`**, not `out/` for standard Next)
- `npm run start` to smoke-test production mode
