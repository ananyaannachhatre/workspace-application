/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'gitlab.com'],
  },
}

module.exports = nextConfig

