import { motion } from 'framer-motion'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import React, { useMemo } from 'react'
import { cantAffordWords, purchaseWords, sample } from '../../../../lib/flavor'
import useLocalStorageState from '../../../../lib/useLocalStorageState.js'
import { useState } from 'react'
import Icon from '@hackclub/icons'
import Modal from '@/components/ui/modal'
import Image from 'next/image'
const ActionArea = ({ item, filterIndex, affordable }) => {
  const buyWord = useMemo(() => sample(purchaseWords), [item.id])
  const getYourRacksUp = useMemo(() => sample(cantAffordWords), [item.id])

  if (filterIndex == 0) {
    return <Button disabled={true}>pick a region to buy!</Button>
  }
  if (item.comingSoon) {
    return <Button disabled={true}>🕑 coming soon...</Button>
  }
  if (item.outOfStock) {
    return <Button disabled={true}>out of stock...</Button>
  }
  if (!affordable) {
    return <Button disabled={true}>💸 {getYourRacksUp}</Button>
  }
  return (
    <form action={`/api/buy/${item.id}`} className="w-full">
      <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 text-3xl enchanted">
        {buyWord}
      </Button>
    </form>
  )
}

export const ShopItemComponent = ({
  item,
  filterIndex,
  personTicketBalance,
  id,
  setFavouriteItems,
  favouriteItems,
}) => {
  let [detailsModal, setDetailsModal] = useState(false)

  const cardHoverProps = {
    whileHover: {
      scale: 1.05,
    },
  }

  const linkIndex = Number(filterIndex) - 1

  return (
    <motion.div {...cardHoverProps} className="cursor-pointer">
      <Modal isOpen={detailsModal} close={() => setDetailsModal(false)}>
        <div className="flex flex-col max-h-[60vh] overflow-y-auto px-2 mb-5">
          <h2 className="text-3xl">{item.name}</h2>
          <h3
            className="text-xl"
            dangerouslySetInnerHTML={{ __html: item.subtitle }}
          ></h3>
          <img
            src={item.imageUrl}
            alt={item.name}
            className="max-w-sm mx-auto my-3"
          />

          {item.description && (
            <p
              className="my-5"
              dangerouslySetInnerHTML={{ __html: item.description }}
            ></p>
          )}

          <Image
            src="/hr.svg"
            className="w-2/3 mx-auto my-3"
            alt=""
            width={461}
            height={11}
          />

          {item.limited_qty && (
            <i className="mt-3 text-amber-100">
              This item is limited, buy it while you can!
            </i>
          )}

          {item.fulfillment_description && (
            <p
              className="my-2 text-lg"
              dangerouslySetInnerHTML={{ __html: item.fulfillment_description }}
            ></p>
          )}

          {item.links && linkIndex >= 0 && item.links[linkIndex] && (
            <p>
              We will most likely order it from{' '}
              <a
                className="underline"
                target="_blank"
                href={item.links[Number(filterIndex) - 1]}
              >
                this link
              </a>
            </p>
          )}

          {item.customs_likely && linkIndex !== 0 && (
            <p className="font-bold italic text-xl">
              Customs may apply outside of US!
            </p>
          )}
        </div>

        <Button
          className="float-right mr-10"
          onClick={() => setDetailsModal(false)}
        >
          Close
        </Button>
      </Modal>

      <Card
        onClick={(e) => {
          if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'FORM') {
            setDetailsModal(true)
          }
        }}
        id={id}
        className="h-full flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl"
      >
        <CardHeader className="pb-2">
          <div className="justify-between inline-block items-start">
            <CardTitle className="text-xl font-bold text-center">
              {item.name}
            </CardTitle>
          </div>
          <hr />
          <p
            className="text-sm text-gray-600 mt-1"
            dangerouslySetInnerHTML={{ __html: item.subtitle ?? '' }}
          ></p>

          <p className="inline-flex gap-3 items-center">
            <span className="text-green-500 font-semibold flex items-center">
              <img
                src="doubloon.svg"
                alt="doubloons"
                width={20}
                height={20}
                className="mr-1"
              />
              {filterIndex == 1 ? item.priceUs : item.priceGlobal}
            </span>

            {item.minimumHoursEstimated && item.maximumHoursEstimated ? (
              <span className="text-xs text-gray-600">
                ({Math.round(item.minimumHoursEstimated)} -{' '}
                {Math.round(item.maximumHoursEstimated)} hours)
              </span>
            ) : null}
          </p>
        </CardHeader>
        {item.imageUrl && (
          <CardContent className="p-0 flex-grow">
            <div className="h-48 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </CardContent>
        )}

        <CardFooter className="pt-4 flex gap-1 ">
          <ActionArea
            item={item}
            filterIndex={filterIndex}
            affordable={
              (filterIndex == 1 ? item.priceUs : item.priceGlobal) <=
              parseInt(personTicketBalance)
            }
          />
          <Button
            onClick={(e) => {
              e.stopPropagation()
              setFavouriteItems((prevFav) => {
                if (prevFav.includes(item.id)) {
                  console.log('remove', prevFav)
                  return prevFav.filter(
                    (favItem) => String(favItem) !== item.id,
                  )
                } else {
                  console.log('add', prevFav)
                  return [...prevFav, item.id]
                }
              })
            }}
          >
            <Icon
              glyph={favouriteItems.includes(item.id) ? 'like-fill' : 'like'}
            />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
