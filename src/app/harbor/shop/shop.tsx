import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/loading_spinner'
import { sample, shopBanner } from '../../../../lib/flavor.js'
import { useState, useEffect } from 'react'
import { getShop, ShopItem } from './shop-utils'
import useLocalStorageState from '../../../../lib/useLocalStorageState.js'
import { HsSession } from '@/app/utils/auth.js'

import { ShopItemComponent } from './shop-item-component.js'
import { ShopkeeperComponent } from './shopkeeper.js'
import { safePerson } from '@/app/utils/airtable'
import Progress from './progress.tsx'
import { sort } from 'next/dist/build/webpack/loaders/css-loader/src/utils'
export default function Shop({ session }: { session: HsSession }) {
  const [filterIndex, setFilterIndex] = useLocalStorageState(
    'shop.country.filter',
    0,
  )
  const [shopItems, setShopItems] = useLocalStorageState<ShopItem[] | null>(
    'cache.shopItems',
    null,
  )
  const [personTicketBalance, setPersonTicketBalance] =
    useLocalStorageState<string>('cache.personTicketBalance', '-')

  const [bannerText, setBannerText] = useState('')
  const isTutorial = sessionStorage.getItem('tutorial')
  useEffect(() => {
    setBannerText(sample(shopBanner))
    getShop().then((shop) => setShopItems(shop))
    safePerson().then((sp) => setPersonTicketBalance(sp.settledTickets))
  }, [])
  const [favouriteItems, setFavouriteItems] = useState(
    JSON.parse(localStorage.getItem('favouriteItems') ?? '[]'),
  )

  const filters = {
    '0': (item: any) => item.enabledAll,
    '1': (item: any) => item.enabledUs,
    '2': (item: any) => item.enabledEu,
    '3': (item: any) => item.enabledIn,
    '4': (item: any) => item.enabledCa,
    '5': (item: any) => item.enabledXx,
  }
  const getFilter = () => {
    // @ts-expect-error reason reason reason
    return filters[filterIndex.toString()] || filters['0']
  }

  if (!shopItems) {
    return (
      <motion.div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </motion.div>
    )
  } else {
    if (filterIndex.toString() == '1') {
      shopItems.sort((lhs: ShopItem, rhs: ShopItem) => {
        return lhs.priceUs - rhs.priceUs
      })
    } else {
      shopItems.sort((lhs: ShopItem, rhs: ShopItem) => {
        return lhs.priceGlobal - rhs.priceGlobal
      })
    }
  }

  const onOptionChangeHandler = (e) => {
    setFilterIndex(e.target.value)
  }

  return (
    <motion.div className="container mx-auto px-4 py-8 text-white">
      <div className="text-center text-white">
        <h1 className="font-heading text-5xl mb-6 text-center relative w-fit mx-auto">
          Pirate Shop
        </h1>
        <p className="text-xl animate-pulse mb-6 rotate-[-7deg] inline-block">
          {bannerText}
        </p>
        <ShopkeeperComponent />
        <br />
        <Progress val={favouriteItems} items={shopItems} />
        <br />
      </div>
      <div className="text-center mb-6 mt-12" id="region-select">
        <label>pick a region to buy something!</label>
        <select
          onChange={onOptionChangeHandler}
          value={filterIndex}
          className="ml-2 text-gray-600 rounded-sm"
        >
          <option value="0">️🏴‍☠️ all across the 7 seas</option>
          <option value="1">🇺🇸 US</option>
          <option value="2">🇪🇺 EU + 🇬🇧 UK</option>
          <option value="3">🇮🇳 India</option>
          <option value="4">🍁 Canada</option>
          <option value="5">🗺 other countries worldwide...</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.filter(getFilter()).map((item: any) => {
          if (item.id == 'item_free_stickers_41' && !isTutorial) return null
          return (
            <ShopItemComponent
              setFavouriteItems={setFavouriteItems}
              favouriteItems={favouriteItems}
              id={item.id}
              key={item.id}
              item={item}
              filterIndex={filterIndex}
              personTicketBalance={personTicketBalance}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
