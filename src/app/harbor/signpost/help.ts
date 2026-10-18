'use server'

//TODO: Delete this file it's weird
import { getWakaSessions } from '@/app/utils/waka'

export async function wakaSessions() {
  return await getWakaSessions()
}
