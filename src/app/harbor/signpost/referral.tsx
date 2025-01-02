'use client'

import { useState, useEffect } from 'react'

import { getSession } from '@/app/utils/auth'
import Pill from '@/components/ui/pill'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import Icon from '@hackclub/icons'
import { getSafePerson } from '@/app/utils/get-safe-person'

export default function Referral() {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getSafePerson().then((sp) => {
      if (sp?.referralLink) {
        setShareLink(sp.referralLink)
      }
    })
  }, [])

  const handleClick = (e) => {
    e.preventDefault()
    if (navigator.share) {
      navigator
        .share({
          url: shareLink || '',
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error))
    } else {
      // copy to clipboard
      navigator.clipboard.writeText(shareLink || '')
      alert('Copied to clipboard!')
    }
  }

  if (!shareLink) return null

  return (
    <div className="text-center mb-5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          asChild
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <a href={shareLink} target="_blank" onClick={handleClick}>
            <Pill msg="Referral link" color="green" glyph="link" />
          </a>
        </PopoverTrigger>
        <PopoverContent className="text-sm">
          <div>
            <p className="inline-flex text-base">Your referral link!</p>
            <ul className="flex flex-col gap-1 mt-2">
              <li className="flex gap-1">
                <Icon
                  glyph="friend"
                  size={20}
                  className="inline flex-shrink-0"
                />{' '}
                Get your friends to sign up at this link!
              </li>
              <li className="flex gap-1">
                <img
                  sizes="20px"
                  src="doubloon.svg"
                  alt="doubloons"
                  className="w-4 sm:w-5 h-4 sm:h-5"
                />{' '}
                Once they ship you'll earn 4 doubloons!
              </li>
              <li className="flex gap-1">
                <span className="w-4 sm:w-5 h-4 sm:h-5">🦈</span>
                You'll also be entered into a raffle to win a smolhaj!
              </li>
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
