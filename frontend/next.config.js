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
}

module.exports = nextConfig