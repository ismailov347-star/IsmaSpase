/** @type {import('next').NextConfig} */
const nextConfig = {
  // No static export - deploy as regular Next.js app
  // Force rebuild for Vercel
  experimental: {
    forceSwcTransforms: true,
  },
  // Force rebuild by changing build ID
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Ensure proper routing for Vercel
  trailingSlash: false,
  // Optimize for production
  swcMinify: true,
  // Enable React strict mode
  reactStrictMode: true,
  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig