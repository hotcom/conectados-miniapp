/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // MiniApp optimizations
  experimental: {
    appDir: true,
  },
  // PWA-like features for MiniApp
  async headers() {
    return [
      {
        source: '/miniapp-manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ]
  },
  // Optimize for mobile (MiniApp runs on mobile)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
