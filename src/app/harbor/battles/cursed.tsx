'use client'

import { useState } from 'react'

import Pill from '@/components/ui/pill'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import Icon from '@hackclub/icons'

export default function Cursed() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="text-center mb-5">
          <Pill msg="️☠️ You have the pirate's curse" color="red" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="text-sm">
        <div>
          <p className="inline-flex text-base">Your votes have been flagged</p>
          <ul className="flex flex-col gap-1 mt-2">
            <li className="flex gap-1">
              <Icon glyph="thumbsdown" size={20} className="inline shrink-0" /> Be more thoughtful
              with your voting.
            </li>
            <li className="flex gap-1">
              <Icon glyph="meh" size={20} className="inline shrink-0" /> Write better descriptions
              for your choices.
            </li>
            <li className="flex gap-1">
              <img
                sizes="20px"
                src="doubloon.svg"
                alt="doubloons"
                className="w-4 sm:w-5 h-4 sm:h-5"
              />{' '}
              Until you lift the curse, your payouts are halved.
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}
