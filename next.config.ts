import type { NextConfig } from 'next'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/tarheel-brands-corp',
    assetPrefix: '/tarheel-brands-corp/',
    images: { unoptimized: true },
  }),
}

export default nextConfig
