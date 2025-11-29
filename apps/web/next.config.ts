import withSerwistInit from '@serwist/next'

import type { NextConfig } from 'next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  additionalPrecacheEntries: [{ url: '/territorios/offline' }],
  register: false,
  disable: process.env.NODE_ENV !== 'production' && !process.argv.includes('--experimental-https'),
})

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    })

    return config
  },
  images: {
    remotePatterns: [
      { hostname: '**.r2.dev' },
      { hostname: '**.r2.cloudflarestorage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
        ],
      },
    ]
  },
}

export default withSerwist(nextConfig as any)
