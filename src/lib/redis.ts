import 'server-only'

import { Redis } from '@upstash/redis'

let client: Redis | undefined

// Initialize on first use, preserving existing Vercel KV credentials.
export const kv = new Proxy({} as Redis, {
  get(_target, property) {
    client ??= new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN!,
    })
    const value = Reflect.get(client, property, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
