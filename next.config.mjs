/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force fresh build — no stale cached pages
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dims.healthgrades.com' },
      { protocol: 'https', hostname: 'ucmscdn.healthgrades.com' },
    ],
  },
};

export default nextConfig;