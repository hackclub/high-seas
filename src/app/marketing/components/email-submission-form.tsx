'use client'

import React, { useState, useRef } from 'react'
import { Button } from '../../../components/ui/button'
import Icon from '@hackclub/icons'
import { usePlausible } from 'next-plausible'

// Basic email validation utility
export const validEmail = (email: string): boolean =>
  !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )

export default function EmailSubmissionForm() {
  const [errorText, setErrorText] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const plausible = usePlausible()
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorText(undefined) // Clear previous errors
    if (timeoutId) clearTimeout(timeoutId) // Clear previous error timeout

    const formData = new FormData(event.currentTarget)
    const emailStr = (formData.get('email') as string)?.trim().toLowerCase()

    if (!emailStr) {
      setErrorText('Please enter an email address.')
      const id = setTimeout(() => setErrorText(undefined), 3000)
      setTimeoutId(id)
      setIsSubmitting(false)
      return
    }

    if (!validEmail(emailStr)) {
      setErrorText('Please enter a valid email address.')
      const id = setTimeout(() => setErrorText(undefined), 3000)
      setTimeoutId(id)
      setIsSubmitting(false)
      return
    }

    // Construct the redirect URL
    const baseUrl = 'https://forms.hackclub.com/t/5bgXNFMfwxus'
    const redirectUrl = `${baseUrl}?e=${encodeURIComponent(emailStr)}`

    // Redirect the user
    plausible('submit-future-events-email')
    window.location.href = redirectUrl
    // No need to setIsSubmitting(false) here as the page will navigate away
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Updated Message */}
        <div className="px-6 py-4 rounded-lg text-md border-2 border-[#3852CD] bg-[#FA4C3599] text-white text-center">
          High Seas has ended! <br />
          Put your email below and {"we'll"} email you about future Hack Club
          events.
        </div>

        {/* Email Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-wrap text-xl md:text-xl justify-center items-center rounded-xl gap-2"
        >
          <input
            type="email" // Use type="email" for basic browser validation
            name="email"
            placeholder="name@email.com"
            required // Make email required
            className="px-6 py-2 rounded-lg text-md border-2 border-[#3852CD] text-black" // Added text-black
            disabled={isSubmitting}
          />
          <Button
            type="submit" // Ensure button type is submit
            disabled={isSubmitting}
            className="px-6 py-2 text-2xl h-full disabled:opacity-50 bg-blues rounded-md text-white pop"
          >
            {isSubmitting ? (
              <Icon glyph="more" className="animate-spin" />
            ) : (
              <>
                Notify Me <Icon glyph="send-fill" />
              </>
            )}
          </Button>
        </form>

        {/* Error Message Area */}
        {errorText ? (
          <div className="mt-2 border-2 border-[#3852CD] bg-[#e61c3d] px-4 py-2 rounded-md text-white text-center">
            {errorText}
          </div>
        ) : (
          // Keep placeholder for layout consistency if desired, or remove
          <div className="mt-2 border-2 opacity-0 border-transparent bg-transparent px-4 py-2 rounded-md text-white">
            &nbsp; {/* Placeholder */}
          </div>
        )}
      </div>
    </>
  )
}
