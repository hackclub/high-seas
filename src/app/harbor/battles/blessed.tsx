'use client'

import { useState } from 'react'

import Pill from '@/components/ui/pill'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import Icon from '@hackclub/icons'

export default function Blessed() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="text-center mb-5">
          <Pill msg="🏴‍☠️ You have the pirate's blessing" color="yellow" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="text-sm">
        <div>
          <p className="inline-flex text-base">What's a blessing?</p>
          <ul className="flex flex-col gap-1 mt-2">
            <li className="flex gap-1">
              <Icon glyph="thumbsup" size={20} className="inline shrink-0" /> Be thoughtful with
              your voting.
            </li>
            <li className="flex gap-1">
              <Icon glyph="message-new" size={20} className="inline shrink-0" /> Write good
              descriptions.
            </li>
            <li className="flex gap-1">
              <Icon glyph="friend" size={20} className="inline shrink-0" /> Keep voting regularly.
            </li>
            <li className="flex gap-1">
              <img
                sizes="20px"
                src="doubloon.svg"
                alt="doubloons"
                className="w-4 sm:w-5 h-4 sm:h-5"
              />{' '}
              While you keep your voting streak, you'll earn 20% more doubloons!
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}
