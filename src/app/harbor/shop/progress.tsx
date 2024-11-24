// harbor/shop/progress.tsx

import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function Progress({ val, items }) {
  const currentTix = Number(Cookies.get('tickets') ?? 0)
  const favItems = items.filter((item) => val.includes(item.id))
  console.log(favItems)
  const max = favItems.sort(
    (a: ShopItem, b: ShopItem) => b.priceGlobal - a.priceGlobal,
  )[0]

  useEffect(() => {
    localStorage.setItem('favouriteItems', JSON.stringify(val))
  }, [val])

  if (!max) {
    return null
  }

  const progressPercentage = currentTix <= max.priceGlobal
    ? (currentTix * 100) / max.priceGlobal
    : 100;

  return (
    <>
      <div className="relative ">
        <div className="relative w-full h-2.5 bg-white rounded overflow-visible">
          <div
            className="w-0 h-full bg-blue-500 rounded transition-all duration-300"
            style={{
              width: progressPercentage + '%',
            }}
          ></div>
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-white font-bold"
            style={{ zIndex: 1 }}
          >
            {Math.round(progressPercentage)}%
          </div>
          {favItems.map((item) => (
            <React.Fragment key={item.id}>
              <a href={'#' + item.id}>
                <div
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2 transition-all duration-300 -translate-y-2.5"
                  style={{
                    left: (item.priceGlobal / max.priceGlobal) * 100 + '%',
                  }}
                  title={item.name}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={
                      'rounded-full h-8 bg-white ring-2 aspect-square object-cover transition-all duration-300' +
                      (currentTix >= item.priceGlobal
                        ? ' ring-blue-500'
                        : ' ring-white')
                    }
                  />
                  <div className="bg-black rounded mt-1 p-1 bg-opacity-75 text-white">
                    {item.priceGlobal}
                  </div>
                </div>
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  )
}
