'use client'

import { useEffect } from 'react'
import { init, isInitialized } from '@fullstory/browser'

export default function Fullstory() {
  useEffect(() => {
    if (!isInitialized()) init({ orgId: 'ARN0J' })
  }, [])
  return null
}
