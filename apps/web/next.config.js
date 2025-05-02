import pkg from './package.json' with { type: 'json' }

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    domains: ['picsum.photos', 'localhost'],
  },
  transpilePackages: [pkg.dependencies, pkg.devDependencies]
    .flatMap(deps => Object.keys(deps))
    .filter(dep => dep.startsWith('@repo/')),
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
          },
        },
      ],
    })
    return config
  },
}

export default nextConfig
