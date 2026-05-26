/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-leaflet@4 with React 18 double-mounts under StrictMode causing
  // "Map container is already initialized" errors. Disabled until upgrade.
  reactStrictMode: false,
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
};

export default nextConfig;
