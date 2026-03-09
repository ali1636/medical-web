/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dims.healthgrades.com',
      },
      {
        protocol: 'https',
        hostname: 'ucmscdn.healthgrades.com',
      },
    ],
  },
};

export default nextConfig;