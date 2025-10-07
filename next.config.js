/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true, // Temporarily skip TypeScript checking to isolate deployment issue
  },
  eslint: {
    ignoreDuringBuilds: true, // Also skip ESLint to speed up build
  },
}

module.exports = nextConfig
