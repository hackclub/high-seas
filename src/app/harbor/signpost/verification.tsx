'use client'

import JaggedCard from '@/components/jagged-card'
import JaggedCardSmall from '@/components/jagged-card-small'
import Cookies from 'js-cookie'
import Link from 'next/link'

const getVerificationMessage = (status: string, reason: string | undefined) => {
  switch (status) {
    case 'Unknown':
      return {
        color: 'yellow',
        message:
          "Hang tight, we're still reviewing your verification documents! Don't worry, it usually takes less than day. In the meantime, get hacking! Your hours still count as long as you've installed Hackatime.",
      }
    case 'Insufficient':
      return {
        color: '#FFA500',
        message: (
          <>
            Blimey! We weren't able to verify you with the proof you submitted
            {reason ? (
              <>
                . According to the reviewer, <strong>{reason}</strong>
              </>
            ) : null}
            <br />
            <br />
            Don't feed the fish though!{' '}
            <strong>
              <Link href="https://forms.hackclub.com/eligibility" className="underline">
                Try again here
              </Link>
            </strong>
            . Email{' '}
            <a href="mailto:verifications@hackclub.com" className="underline">
              verifications@hackclub.com
            </a>{' '}
            if you have any questions.
          </>
        ),
      }
    case 'Ineligible':
      return {
        color: '#ff0000',
        message: (
          <>
            Uh-oh, seems like you're an adult… unfortunately, High Seas is only for teenagers 18 and
            under. Email{' '}
            <a href="mailto:verifications@hackclub.com" className="underline">
              verifications@hackclub.com
            </a>{' '}
            if you think this is a misunderstanding.
          </>
        ),
      }
    default:
      return {
        color: '#FFA500',
        message:
          "Oh no, you haven't filled out a verification form yet! But… how did you even get to this page then?? That's not supposed to be possible… please make a post to #high-seas-help 🤔",
        redirect: true,
      }
  }
}

export default function Verification() {
  const verificationCookie = Cookies.get('verification')
  if (!verificationCookie) return null

  let status: string, reason: string | undefined
  try {
    const parsed = JSON.parse(verificationCookie)

    status = parsed.status
    reason = parsed.reason
  } catch (e) {
    console.error("Could't parse verification feed cookie into JSON:", e)
    return null
  }

  if (!status || status.startsWith('Eligible')) return null

  const { message, redirect } = getVerificationMessage(status, reason)

  return (
    <JaggedCardSmall bgColor={'#EF4444'} className="text-white">
      <p style={{ textWrap: 'pretty' }}>{message}</p>
      {redirect ? (
        <Link href="https://forms.hackclub.com/eligibility" className="underline">
          Verify Yourself!
        </Link>
      ) : null}
    </JaggedCardSmall>
  )
}
