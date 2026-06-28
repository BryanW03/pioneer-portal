/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Skip type checking and linting during build (faster, errors caught locally)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  // Disable static generation for all pages - everything is dynamic (uses auth/DB)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}

module.exports = nextConfig
