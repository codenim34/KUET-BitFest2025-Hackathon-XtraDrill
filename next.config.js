/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      }
    ]
  },
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/webhooks/socket",
        destination: "/api/webhooks/socket",
      },
      // Add other rewrite rules as needed
    ];
  },
};

module.exports = nextConfig;
