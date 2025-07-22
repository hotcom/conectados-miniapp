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
  // Note: appDir is now default in Next.js 13+ and removed in 15+
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
