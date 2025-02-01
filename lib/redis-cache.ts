import 'server-only'

import { kv } from '@vercel/kv'

const DEFAULT_TIMEOUT = 30 * 1000 // 30 seconds

export async function cached(
  key: string,
  action: () => Promise<any>,
  timeout = DEFAULT_TIMEOUT,
): Promise<any> {
  const cachedValue = await kv.get(key)
  if (cachedValue) {
    console.log(`Cache hit for ${key}`)
    return cachedValue
  }

  const value = await action()
  console.log(`Setting cache for ${key}`)
  console.log('value', value)
  await kv.set(key, JSON.stringify(value), {
    ex: timeout,
  })
  return value
}
