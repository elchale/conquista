/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-leaflet@4 with React 18 double-mounts under StrictMode causing
  // "Map container is already initialized" errors. Disabled until upgrade.
  reactStrictMode: false,
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  // The crónica PDFs live in public/docs and are served as static CDN assets.
  // Guard against Next's file tracer ever bundling them (or any large doc) into
  // a serverless function — that previously pushed the [tipo] function to 445MB
  // and broke the Vercel deploy (300MB limit).
  outputFileTracingExcludes: {
    '*': ['public/docs/**', '**/*.pdf'],
  },
};

export default nextConfig;
