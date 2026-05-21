'use client'

import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ShopItemComponent } from '../harbor/shop/shop-item-component.js'
import { ShopkeeperComponent } from '../harbor/shop/shopkeeper.js'
import { Card } from '@/components/ui/card'
import { SoundButton } from '../../components/sound-button.js'
import { transcript } from '../../../lib/transcript.js'
import shopData from '../harbor/shop/shop-data.json'
import type { ShopItem } from '../harbor/shop/shop-utils'

const staticShopItems: ShopItem[] = shopData.map((item: any) => ({
  ...item,
  links: [null, null, null, null],
  fulfilledAtEnd: false,
  customs_likely: item.customsLikely,
  fulfillment_description: item.fulfillmentDescription,
  limited_qty: item.limitedQty,
  outOfStock: item.outOfStock ?? false,
  comingSoon: item.comingSoon ?? false,
}))

const filters: Record<string, (item: ShopItem) => boolean> = {
  '0': (item) => !!item.enabledAll,
  '1': (item) => !!item.enabledUs,
  '2': (item) => !!item.enabledEu,
  '3': (item) => !!item.enabledIn,
  '4': (item) => !!item.enabledCa,
  '5': (item) => !!item.enabledXx,
  '6': (item) => !!item.enabledAu,
}

export default function PublicShop() {
  const [filterIndex, setFilterIndex] = useState(0)
  const [favouriteItems, setFavouriteItems] = useState<string[]>([])
  const [cursed, setCursed] = useState(false)
  const [blessed, setBlessed] = useState(false)
  const [balance, setBalance] = useState('100')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const bannerText = useMemo(() => transcript('banner'), [])

  const getFilter = () => filters[filterIndex.toString()] || filters['0']

  const sortedItems = useMemo(() => {
    const items = [...staticShopItems]
    if (filterIndex.toString() === '1') {
      items.sort((a, b) => a.priceUs - b.priceUs)
    } else {
      items.sort((a, b) => a.priceGlobal - b.priceGlobal)
    }
    return items
  }, [filterIndex])

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
        className="w-full max-w-4xl flex flex-col mx-auto mt-20 mb-14"
        type={'cardboard'}
      >
        <div className="p-3">
          <motion.div className="container mx-auto px-4 py-8 text-white relative">
            <div className="text-center text-white">
              <h1 className="font-heading text-5xl mb-6 text-center relative w-fit mx-auto">
                Pirate Shop
              </h1>
              <p className="text-xl animate-pulse mb-6 rotate-[-7deg] inline-block">
                {bannerText}
              </p>
            </div>

            <ShopkeeperComponent balance={balance} cursed={cursed} blessed={blessed} buyHref="/" />

            <div className="mt-2 mb-4">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="mx-auto block px-2 py-1 rounded text-white/40 text-xs hover:text-white/70 transition-colors"
              >
                ⚙ {settingsOpen ? 'hide settings' : 'settings'}
              </button>

              {settingsOpen && (
                <div
                  className="mt-2 p-3 rounded-lg max-w-sm mx-auto space-y-3"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="text-xs text-white/40 text-center leading-relaxed">
                    the event is over, but you can tweak these to see how the shopkeeper would react to different users
                  </p>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/80">Status</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setCursed(!cursed); if (!cursed) setBlessed(false) }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          cursed
                            ? 'bg-red-600 text-white'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {cursed ? '☠️ Cursed' : '☠️'}
                      </button>
                      <button
                        onClick={() => { setBlessed(!blessed); if (!blessed) setCursed(false) }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          blessed
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {blessed ? '✨ Blessed' : '✨'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/80">
                      <img
                        src="/doubloon.svg"
                        alt="doubloons"
                        className="w-4 h-4 inline mr-1"
                      />
                      Balance
                    </label>
                    <input
                      type="number"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      min="0"
                      className="w-24 px-2 py-1 rounded text-sm bg-white/10 text-white border border-white/20 text-right"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mb-6 mt-12" id="region-select">
              <label>pick a region to see prices!</label>
              <select
                onChange={(e) => setFilterIndex(Number(e.target.value))}
                value={filterIndex}
                className="ml-2 text-gray-600 rounded-sm"
              >
                <option value="0">️🏴‍☠️ all across the 7 seas</option>
                <option value="1">🇺🇸 US</option>
                <option value="2">🇪🇺 EU + 🇬🇧 UK</option>
                <option value="3">🇮🇳 India</option>
                <option value="4">🍁 Canada</option>
                <option value="6">🇦🇺 ɐᴉlɐɹʇsn∀</option>
                <option value="5">🗺 other countries worldwide...</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.filter(getFilter()).map((item) => (
                <ShopItemComponent
                  setFavouriteItems={setFavouriteItems}
                  favouriteItems={favouriteItems}
                  id={item.id}
                  key={item.id}
                  item={item}
                  filterIndex={filterIndex}
                  personTicketBalance={balance}
                  buyHref="/"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </Card>
    </>
  )
}
