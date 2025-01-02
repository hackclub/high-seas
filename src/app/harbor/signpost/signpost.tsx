'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Verification from './verification'
import Platforms from '@/app/utils/wakatime-setup/platforms'
import JaggedCard from '../../../components/jagged-card'
import Cookies from 'js-cookie'
import FeedItems from './feed-items'
import { getWakaSessions } from '@/app/utils/get-waka-sessions'
import Referral from './referral'
import { getStickyUrls } from './help'
import pluralize from '../../../../lib/pluralize.js'
import BestShips from './best-ships'
import LeaderboardOptIn from './leaderboard'

export default function Signpost() {
  let wakaKey: string | null = null
  let hasHb: boolean | null = null
  const wakaCookie = Cookies.get('waka')
  if (wakaCookie) {
    try {
      const parsedCookie = JSON.parse(wakaCookie)
      if (Object.hasOwn(parsedCookie, 'key')) {
        wakaKey = parsedCookie.key
      } else {
        throw new Error(
          "The parsed waka cookie has no key 'key' (the waka api key)",
        )
      }

      if (Object.hasOwn(parsedCookie, 'hasHb')) {
        hasHb = parsedCookie.hasHb
      } else {
        throw new Error("The parsed waka cookie has no key 'hasHb'")
      }
    } catch (e) {
      console.error("Couldn't JSON parse the waka cookie: ", e)
    }
  }

  const [wakaSessions, setWakaSessions] =
    useState<{ key: string; total: number }[]>()
  const [stickyUrls, setStickyUrls] = useState([])

  useEffect(() => {
    getWakaSessions().then((s) => {
      setWakaSessions(s.projects)
      if (s.projects.length > 0) {
        hasHb = true
      }
    })

    getStickyUrls().then(setStickyUrls)
  }, [])

  const wakaDuration = wakaSessions?.reduce((a, p) => (a += p.total), 0)
  const hms = { hours: 0, minutes: 0, seconds: 0 }
  if (wakaDuration) {
    hms.hours = Math.floor(wakaDuration / 3600)
    hms.minutes = Math.floor((wakaDuration % 3600) / 60)
    hms.seconds = wakaDuration % 10
  }

  // Show or hide instructions for installing Hackatime
  const [showInstructions, setShowInstructions] = useState(!hasHb)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white"
    >
      <h1 className="font-heading text-5xl font-bold text-white mb-2 text-center">
        The Signpost
        <img
          src="/signpost.png"
          alt="a signpost with 4 boards"
          width={32}
          className="inline-block ml-4 hidden sm:inline"
        />
      </h1>

      <p className="text-center text-white text-xs sm:text-sm mb-8">
        Have questions? Need help? Post in{' '}
        <Link
          className="text-blue-500"
          href="https://hackclub.slack.com/archives/C07PZNMBPBN"
        >
          #high-seas-help
        </Link>
        !
      </p>

      <Referral />
      <Verification />

      <div className="text-center mb-2">
        <h2 className="font-heading text-2xl font-bold">Stats</h2>
        <p className="text-md md:text-lg">
          {hasHb ? (
            <>
              {wakaDuration ? (
                <p>
                  <span>
                    You've logged {pluralize(hms.hours, 'hour')},{' '}
                    {pluralize(hms.minutes, 'minute')},{' '}
                  </span>
                  <br className="sm:hidden" />
                  <span>
                    and {pluralize(hms.seconds, 'second')} of coding time so
                    far!
                  </span>
                </p>
              ) : (
                'Project time loading...'
              )}
            </>
          ) : (
            <>
              You have <b>NOT</b> set up Hackatime. Your hours are <b>not</b>{' '}
              being tracked!
            </>
          )}
        </p>
        <p />
      </div>

      <JaggedCard shadow={false} small={!showInstructions}>
        {wakaKey ? (
          <Platforms
            wakaKey={wakaKey}
            hasHb={hasHb}
            showInstructions={showInstructions}
            setShowInstructions={setShowInstructions}
          />
        ) : (
          <p>Loading Hackatime token...</p>
        )}
      </JaggedCard>

      <a
        className="block mt-6 mb-2"
        href="https://hackclub.slack.com/archives/C0266FRGT/p1734471796551819"
      >
        <img
          className="mx-auto rounded w-1/2"
          src="https://cloud-l35vudm4s-hack-club-bot.vercel.app/0sticky-holidays.png"
          alt="sticky holidays banner"
        />
        <p className="text-center mt-1 text-sm">
          Confused? Click to see the #announcements post ^^
        </p>
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stickyUrls.map((slug, idx) => (
          <div className="w-full h-fit" key={idx}>
            <JaggedCard
              shadow={false}
              className="w-full pb-8 h-full flex flex-col gap-2 justify-between items-center"
            >
              <p className="text-lg">Day {idx + 1}</p>
              <p>{stickyUrls.length - 1 === idx ? 'Unlocks tomorrow' : null}</p>
              <div className="h-40 mx-auto rounded">
                <img
                  src={`https://pub-37a91ce7bf5e4bd4a21b81796a4b66c4.r2.dev/${slug}`}
                  alt=""
                  className="h-full"
                />
              </div>
            </JaggedCard>
          </div>
        ))}
      </div>

      <BestShips />

      <LeaderboardOptIn />

      <h2 className="mt-8 font-heading text-2xl font-bold mb-4 text-center">
        Changelog
      </h2>
      <FeedItems />
    </motion.div>
  )
}
