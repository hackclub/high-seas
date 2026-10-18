/** @type {import('next').NextConfig} */

import { execSync } from 'node:child_process'

function getCommitHash() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'unknown'
  }
}
import { withSentryConfig } from '@sentry/nextjs/config'

const nextConfig = {
  // Existing application type errors are tracked by `bun run typecheck`.
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: '/proxy/js/script.js', destination: 'https://plausible.io/js/script.js' },
      { source: '/proxy/api/event', destination: 'https://plausible.io/api/event' },
    ]
  },
  turbopack: {
    root: import.meta.dirname,
    rules: {
      '*.yml': { loaders: ['yaml-loader'], as: '*.js' },
      '*.yaml': { loaders: ['yaml-loader'], as: '*.js' },
    },
  },
  env: {
    COMMIT_HASH: getCommitHash(),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.slack-edge.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
}

const sentryContext = {
  org: 'malted',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: '/monitoring',
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
}

export default withSentryConfig(nextConfig, sentryContext)
