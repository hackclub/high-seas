import 'server-only'

import { kv } from '@vercel/kv'
import { v4 as uuidv4 } from 'uuid'

const LOCK_TIMEOUT = 30 * 1000 // 30 seconds

async function aquireLock(key: string): Promise<string | null> {
  const lockKey = `lock:${key}`
  const lockValue = uuidv4()
  const acquired = await kv.set(lockKey, lockValue, {
    nx: true,
    px: LOCK_TIMEOUT,
  })
  return acquired ? lockValue : null
}

async function releaseLock(lockKey: string, lockValue: string): Promise<void> {
  const currentLockValue = await kv.get(lockKey)
  if (currentLockValue === lockValue) {
    await kv.del(lockKey)
  }
}

export async function withLock<T>(
  key: string,
  action: () => Promise<T>,
): Promise<T | null> {
  const lockValue = await aquireLock(key)
  if (!lockValue) {
    throw new Error(`Failed to acquire lock for key: ${key}`)
  }
  try {
    return await action()
  } finally {
    await releaseLock(`lock:${key}`, lockValue)
  }
}
