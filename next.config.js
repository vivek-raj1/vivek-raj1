/** @type {import('next').NextConfig} */
// Next 16 defaults to Turbopack for `next dev` / `next build`; with `output: 'export'`,
// webpack is more reliable here — npm scripts pass `--webpack`.
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
