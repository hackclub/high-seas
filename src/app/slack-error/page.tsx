'use client'

import { AlertCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { useMemo } from 'react'
import { reportError } from './report-error'

export default function SlackAuthErrorPage({
  searchParams,
}: {
  searchParams: { err?: string }
}) {
  const { err } = searchParams
  useMemo(() => {
    if (err) {
      reportError(err)
    }
  }, [])

  const isSignupDisabled = err?.includes('Sign-ups are currently disabled')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4A154B]">
      <div className="w-fit bg-white p-8 rounded-lg shadow-lg text-center">
        <AlertCircle
          className="mx-auto h-12 w-12 text-red-500 mb-4"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isSignupDisabled ? 'Sign-ups are closed!' : 'Going overboard!'}
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          {isSignupDisabled
            ? 'High Seas has ended! Sign-ups are disabled.'
            : "We Arrrr over capacity right now, but we got your request to join the crew... we'll reach out once we figure out how to keep this ship from capsizing."}
          {!isSignupDisabled &&
            (err || 'An error occurred during Slack authentication.')}
        </p>

        <div className="flex flex-col gap-4">
          <a
            href="https://hackclub.com/slack"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#4A154B] hover:bg-[#611f64] rounded-lg transition-colors duration-200 shadow-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm6-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
            Join the Hack Club Slack
          </a>

          <Link className={buttonVariants({ variant: 'outline' })} href="/">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
