/** @type {import('next').NextConfig} */
// Next 16 defaults to Turbopack for `next dev` / `next build`; webpack is passed via npm scripts.
// Do not use `output: 'export'` for Vercel Git deploys: Next 16 no longer writes `out/routes-manifest.json`,
// which Vercel's Next.js integration still expects when Output Directory is `out`.
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
