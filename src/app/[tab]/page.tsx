'use client'

import { notFound } from 'next/navigation'
import Harbor from '../harbor/tabs/tabs'
import { createMagicSession, getSession } from '../utils/auth'
import { Card } from '@/components/ui/card'
import { SoundButton } from '../../components/sound-button.js'
import { useEffect } from 'react'
import useLocalStorageState from '../../../lib/useLocalStorageState'

export default function Page({
  params,
  searchParams,
}: {
  params: { tab: string }
  searchParams: any
}) {
  const [session, setSession] = useLocalStorageState('cache.session', {})

  useEffect(() => {
    getSession().then((s) => {
      if (s) {
        setSession(s)
      } else {
        window.location.pathname = '/'
      }
    })
  }, [])

  const { tab } = params
  const validTabs = ['signpost', 'shipyard', 'wonderdome', 'shop', 'tavern']
  if (!validTabs.includes(tab)) return notFound()

  const { magic_auth_token } = searchParams

  if (magic_auth_token) {
    console.info('maigc auth token:', magic_auth_token)
    // First check for is_full_user, if so, redirect to slack auth
    // const person =

    createMagicSession(magic_auth_token).then(
      () => (window.location.href = window.location.pathname),
    )
  }

  return (
    <>
      <div
        className="inset-0 z-[-1]"
        style={{
          backgroundImage: 'url(/bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'fixed',
        }}
      />
      <SoundButton />
      <Card
        className="w-full max-w-full max-w-4xl flex flex-col mx-auto mt-20 mb-14"
        type={'cardboard'}
      >
        {session?.slackId ? (
          <Harbor session={session} currentTab={tab} />
        ) : (
          <p className="text-center">Session is loading...</p>
        )}
      </Card>
    </>
  )
}
