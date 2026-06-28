/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Render deployment
  output: 'standalone',
  experimental: {},
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  // Ensure proper port binding
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
}

module.exports = nextConfig
