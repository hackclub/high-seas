'use client'

import React from 'react'
import Marquee from 'react-fast-marquee'
import Image from "next/legacy/image"

import Photo1 from '../marquee/1.jpeg'
import Photo2 from '../marquee/2.png'
import Photo3 from '../marquee/3.jpeg'
import Photo4 from '../marquee/4.jpeg'
import Photo5 from '../marquee/5.jpeg'

export default function ScrollShop() {
  return (
    <Marquee autoFill pauseOnHover speed="75">
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://cloud-a823iqif6-hack-club-bot.vercel.app/0image.png"
          alt="Photo 1"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://cloud-djbef06tx-hack-club-bot.vercel.app/0image.png"
          alt="Photo 2"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://cloud-1e0x3bwfz-hack-club-bot.vercel.app/0image.png"
          alt="Photo 3"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://cloud-d8js788lz-hack-club-bot.vercel.app/0image.png"
          alt="Photo 4"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://noras-secret-cdn.hackclub.dev/shop/raspberry_pi_5.png"
          alt="Photo 5"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://noras-secret-cdn.hackclub.dev/shop/gh_miir_backpack.png"
          alt="Photo 5"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://noras-secret-cdn.hackclub.dev/shop/bambu_a1_mini.png"
          alt="Photo 5"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://noras-secret-cdn.hackclub.dev/shop/ipad.png"
          alt="Photo 5"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
      <div
        style={{ width: '200px', margin: '0 10px' }}
        className="border-dashed border-4 border-blue-800 p-4"
      >
        <Image
          src="https://noras-secret-cdn.hackclub.dev/shop/fw_13.png"
          alt="Photo 5"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
        />
      </div>
    </Marquee>
  )
}
