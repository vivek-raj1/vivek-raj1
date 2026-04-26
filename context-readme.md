# Session context (Vivek-Raj-Portfolio)

## Skills section (latest)

- **Data-driven**: Categories and skill cards load only from `public/data/skills.json`. Every skill row has a stable **`id`** (add new rows under `categories[].items`; UI maps them automatically).
- **Framer Motion**: Section uses `motion.section`, staggered category pills (`StaggerGroup` + `motion.div` wrappers), list **stagger** via `variants` on `motion.ul` / `motion.li`, `AnimatePresence` on filter changes, spring motion on cards (tilt, dial, hover orbs). **`key={active}`** on the grid so changing the filter re-runs the enter animation cleanly.
- **Variable card heights**: Grid uses **`auto-rows-min`**, **`items-start`**, **`self-start`** on cards so different content heights do not stretch the row unnaturally.
- **Removed “DevOps console” types**: Dropped optional `toolbox` / `ToolboxCardData` from `lib/types.ts` (no interactive copy/link/scroll cards in UI). Extend skills only via **`categories[].items`**.

## Done this session

- **DevOps toolbox UI**: Implemented the missing `components/sections/SkillsToolbox.tsx` so the "DevOps console" in **Skills** works. It is **driven from** `public/data/skills.json` under `toolbox` (`eyebrow`, `title`, `subtitle`, `cards[]`). Add more skills/cards by appending to `toolbox.cards` (each card: `id`, `title`, `body`, `icon`, `action`: `copy` | `link` | `scroll`), plus skill rows under `categories[].items`.
- **Framer Motion**: The toolbox uses Motion for staggered list entry, card hover-lift, and tap feedback. The project already depended on `framer-motion` in `package.json`.
- **Experience timeline**: Removed spring-based draw animation on the connector (which could settle with tiny oscillation and look "blinking"). Replaced with a **one-shot ease tween**; milestone dot uses a **latched** `milestoneSeen` state so the center ring/dot does not flicker with `inView` edge cases. Tuning: `useInView` `amount: 0.35`, `margin: ... -5%`.
- **Build fix**: Added `components/fx/HeroThreeCanvas.tsx` (placeholder) because `Hero.tsx` dynamically imported a missing file; production build and static export are green.
- **`.gitignore`**: Extended with `tmp/`, archives, and optional patterns for local editor noise and `.claude/settings.local.json` (keeps the rest of `.claude/` committable if you want the skills there).
- **Vercel mapping**: Added root `vercel.json` with `outputDirectory: "out"` to match `next.config.js` `output: "export"`.
- **CI**: Added `.github/workflows/vercel-production.yml` — runs `npm ci`, `npm run build`, then `npx vercel@39 deploy out --prod` (requires the three Vercel secrets in GitHub; see comment block in the workflow file).

## Pending / your follow-ups

- **Vercel secrets**: In the GitHub repo, add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` (or delete the workflow if you only use Vercel’s built-in Git integration to avoid **two** production deploys per push).
- **Double deploy risk**: If the repo is connected in the Vercel dashboard **and** this workflow is enabled, turn one of them off.
- **Hero WebGL**: `HeroThreeCanvas` is currently `null` — add a Three.js scene when you are ready; `three` is already a dependency.
- **Optional**: Pin `vercel` in `devDependencies` if you want identical CLI behavior locally and in CI without relying on `npx` resolution.

## Quick JSON extension examples

- New toolbox card (in `public/data/skills.json` → `toolbox.cards`):

  `{ "id": "copy-helm", "title": "Helm", "body": "…", "icon": "boxes", "action": { "type": "copy", "value": "helm list -A" } }`

- New skill row: add to the right `categories[].items` with `name`, `level`, `note`.

## Verify locally

- `npm run build` (generates `out/`)
- `npx vercel dev` or `npx vercel deploy out` after linking, if you test deploys from your machine
