/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Add this to disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig