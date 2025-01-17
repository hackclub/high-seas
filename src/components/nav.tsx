'use server'

import { getSession } from '@/app/utils/auth'
import SignOut from './sign_out'
import SignIn from './sign_in'
import Image from 'next/image'
import Logo from '/public/logo.png'

export default async function Nav() {
  const session = await getSession()

  return (
    <div className="absolute flex items-center justify-between top-0 left-0 right-0 h-14 px-2 m-0 sm:m-2 bg-transparent z-30 text-white">
      <div
        style={{
          position: 'fixed',
          zIndex: 30,
        }}
      >
        <a href="/">
          <Image
            src={Logo}
            alt="High Seas!"
            height={48}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </a>
      </div>
      <span />
      <div className="flex gap-4 items-center text-nowrap">
        {session?.picture && session.givenName ? (
          <div className="flex gap-2 items-center">
            <Image
              src={session.picture}
              width={32}
              height={32}
              alt="profile picture"
              className="rounded-full"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            <p className="hidden lg:block">Hey, {session.givenName}!</p>{' '}
          </div>
        ) : null}
        {session ? (
          <>
            <SignOut />
          </>
        ) : (
          <SignIn variant="small" session={session} />
        )}
      </div>
    </div>
  )
}
