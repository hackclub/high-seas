/** @type {import('next').NextConfig} */

import { withPlausibleProxy } from 'next-plausible'
import { execSync } from 'child_process'
const commitHash = execSync('git log --pretty=format:"%h" -n1')
  .toString()
  .trim()

const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  env: {
    COMMIT_HASH: commitHash,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.slack-edge.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default withPlausibleProxy()(nextConfig)
