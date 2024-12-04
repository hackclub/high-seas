'use client'

import React, { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Shipyard from '../shipyard/shipyard'
import Battles from '../battles/battles'
import Shop from '../shop/shop'
import { useEffect } from 'react'
import SignPost from '../signpost/signpost'
import { tour } from './tour'
import useLocalStorageState from '../../../../lib/useLocalStorageState'
import { useRouter } from 'next/navigation'
import { getSession, type HsSession } from '@/app/utils/auth'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { sample, zeroMessage } from '../../../../lib/flavor'
import Cookies from 'js-cookie'
import JaggedCard from '@/components/jagged-card'
import Icon from '@hackclub/icons'
import { ShopItem } from '../shop/shop-utils'

const doubloonTips = [
  {
    icon: 'door-enter',
    msg: (
      <p>
        You earn doubloons through{' '}
        <span className="text-[#AD28C6]">shipping projects</span>.
      </p>
    ),
  },
  {
    icon: 'door-leave',
    msg: (
      <p>
        You spend them on <span className="text-[#AD28C6]">prizes</span> in the
        shop.
      </p>
    ),
  },
  {
    icon: 'list',
    msg: (
      <p>How many you earn is affected by how others vote on your projects.</p>
    ),
  },
  {
    icon: 'bolt',
    msg: <p>Higher quality projects means more doubloons!</p>,
  },
]

const Balance = () => {
  'use client'

  const [open, setOpen] = useState(false)
  const brokeMessage = useMemo(() => sample(zeroMessage), [])

  const balance = Number(Cookies.get('tickets'))
  if (Number.isNaN(balance)) {
    getSession().then((s) =>
      console.error(
        'Ticket balance is NaN, which signals an issue with the ticket fetching from Airtable in middleware. Session: ',
        JSON.stringify(s),
      ),
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex items-center gap-1">
          <img
            src="doubloon.svg"
            alt="doubloons"
            className="w-4 sm:w-5 h-4 sm:h-5"
          />
          <span className="mr-2">
            {balance || balance === 0 ? Math.floor(balance) : '...'}
            <span className="sm:inline hidden"> Doubloons</span>
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="text-sm">
        {balance == 0 ? (
          <div>
            {brokeMessage} Ship something to earn more!
            <hr className="my-2" />
          </div>
        ) : null}

        <div>
          <p className="inline-flex text-base">
            What are&nbsp;
            <span className="inline-flex items-center gap-1">
              <img
                src="doubloon.svg"
                alt="doubloons"
                className="w-4 sm:w-5 h-4 sm:h-5"
              />
              doubloons?
            </span>
          </p>
          <ul className="flex flex-col gap-1 mt-2">
            {doubloonTips.map(({ icon, msg }, idx) => (
              <li key={idx} className="flex gap-1">
                <Icon glyph={icon} size={20} className="inline flex-shrink-0" />{' '}
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-purple-dark rounded-lg p-8 text-white text-center">
        <p className="text-xl mb-4">Loading...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
      </div>
    </div>
  )
}

const fsIdentify = (id: string, email: string, displayName?: string) => {
  if (!!window && !!window?.FS && !!window?.FS?.identify) {
    window?.FS?.identify(id, {
      email,
      displayName,
    })
  }
  return null
}

export default function Harbor({
  currentTab,
  session,
}: {
  currentTab: string
  session: HsSession
}) {
  const [shopItems, setShopItems] = useLocalStorageState<ShopItem[] | null>(
    'cache.shopItems',
    null,
  )

  // default to true so we don't flash a warning at the user
  const [hasHb, setHasHb] = useLocalStorageState<boolean>('cache.hasHb', true)
  // All the content management for all the tabs goes here.

  const router = useRouter()

  const handleTabChange = (newTab: string) => {
    router.push(`/${newTab}`) // Navigate to the new tab slug
  }

  useEffect(() => {
    if (!!session.email && !!session.slackId) {
      fsIdentify(session.slackId, session.email, session.name)
    }
  }, [session])

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let academyCompleted

    try {
      academyCompleted = JSON.parse(Cookies.get('academy-completed'))
    } catch (e) {
      console.error(e)
      academyCompleted = false
    }

    if (!academyCompleted) {
      tour()
    }
  }, [])

  const tabs = [
    {
      name: <>Signpost</>,
      path: 'signpost',
      component: <SignPost session={session} />,
    },
    {
      name: <>Shipyard</>,
      path: 'shipyard',
      component: <Shipyard session={session} />,
      lockOnNoHb: true,
    },
    {
      name: <>Wonderdome</>,
      path: 'wonderdome',
      component: <Battles session={session} />,
      lockOnNoHb: true,
    },
    {
      name: <>Shop</>,
      path: 'shop',
      component: <Shop session={session} />,
    },
  ]

  let usPrices = false
  try {
    usPrices =
      JSON.parse(localStorage.getItem('shop.country.filter')!)?.value === 1
  } catch (e) {}
  const currentTix = Number(Cookies.get('tickets') ?? 0)
  const nextPrize: ShopItem = shopItems
    ? shopItems
        .filter(
          (a: ShopItem) => (usPrices ? a.priceUs : a.priceGlobal) >= currentTix,
        )
        .sort((a: ShopItem, b: ShopItem) =>
          usPrices ? a.priceUs - b.priceUs : a.priceGlobal - b.priceGlobal,
        )[0]
    : null

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div className="mt-4">
        {!hasHb ? (
          <JaggedCard className="!p-4">
            <p className="text-center text-white">
              No Hackatime install detected. Have you run the script?{' '}
              <a className="underline" href="/signpost">
                See the instructions at the Signpost.
              </a>
            </p>
          </JaggedCard>
        ) : null}
        <Tabs
          value={currentTab}
          className="flex-1 flex flex-col"
          onValueChange={handleTabChange}
        >
          <TabsList className="mx-2 my-2 relative h-16">
            <div className="flex flex-col items-center">
              <div>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.path} value={tab.path}>
                    {tab.name}
                  </TabsTrigger>
                ))}
                <div className="right-px top-2 absolute mr-px text-green-400 text-sm">
                  <Balance />
                </div>
              </div>

              {nextPrize ? (
                <div>
                  <p className="text-sm">
                    <img
                      src="doubloon.svg"
                      alt="doubloons"
                      className="inline w-4 sm:w-5 h-4 sm:h-5 mr-1"
                    />
                    {Math.ceil(
                      (usPrices ? nextPrize.priceUs : nextPrize.priceGlobal) -
                        currentTix,
                    )}{' '}
                    doubloons until {nextPrize.name}!
                  </p>
                </div>
              ) : null}
            </div>
          </TabsList>
          <div className="flex-1 p-3" id="harbor-tab-scroll-element">
            {tabs.map((tab) => (
              <TabsContent key={tab.path} value={tab.path} className="h-full">
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </>
  )
}
