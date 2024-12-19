'use client'

import { useState, useEffect, useRef } from 'react'
import { sample } from '../../lib/flavor'

const musicSamples = [
  'https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/5drunk_raccoon_audio.mp4',
  'https://cloud-hrqk6nzbv-hack-club-bot.vercel.app/0old_runescape_soundtrack____sea_shanty2__bjhf0l7pfo8__audio.mp4',
]

const trumpetUrl =
  'https://cloud-74zjdhued-hack-club-bot.vercel.app/1frame_12.png'
const flagUrl = 'https://cloud-pfu2uqcdh-hack-club-bot.vercel.app/0frame_6.png'

const Trumpet = ({ bot, rot, flip = false }) => {
  const pos = {}
  if (flip) {
    pos.left = '-4%'
  } else {
    pos.right = '-4%'
  }
  const slide_in = flip ? 'animate-slide_in_left' : 'animate-slide_in_right'
  // We need to define this because tailwind's JIT doesn't recognize them unless they're defined here
  const animations = [
    'animate-trumpet2',
    'animate-trumpet3',
    'animate-trumpet4',
  ]
  return (
    <div
      className={`fixed opacity-0 ${slide_in}`}
      style={{
        animationDelay: '9000ms',
        animationFillMode: 'forwards',
        bottom: `${bot}%`,
        ...pos,
        zIndex: 3000,
      }}
    >
      <div style={{ transform: `rotate(${rot}deg)` }}>
        <div
          className={sample(animations)}
          style={{ animationDuration: '2000ms' }}
        >
          <div className="animate-quick_yapping">
            <img
              src={trumpetUrl}
              className={`w-42 ${flip ? 'scale-x-[-1]' : ''}`}
              alt="trumpet"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const Flag = ({ bot, rot, ani, dur, flip = false }) => {
  const pos = {}
  if (flip) {
    pos.left = '10%'
  } else {
    pos.right = '10%'
  }
  const slide_in = flip ? 'animate-slide_in_left' : 'animate-slide_in_right'
  return (
    <div
      className={`fixed opacity-0 ${slide_in}`}
      style={{
        animationDelay: '9000ms',
        animationFillMode: 'forwards',
        top: `0%`,
        ...pos,
      }}
    >
      <div style={{ transform: `rotate(${rot}deg)` }}>
        <div
          className={`inline-block animate-[${ani}_750ms_ease-out_0ms_alternate_infinite]`}
        >
          <div className="animate-quick_yapping">
            <img
              src={flagUrl}
              className={`w-24 ${flip ? 'scale-x-[-1]' : ''}`}
              alt="trumpet"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const theTrumpets = () => {
  return (
    <>
      {/* first trumpet always starts from the right and bobs up and down  */}
      <div className="fixed bottom-20 -right-4 animate-slide_in_right">
        <div className="rotate-[17deg]">
          <div className="inline-block animate-trumpet1 repeat-infinite">
            <div className="animate-quick_yapping">
              <img
                src={
                  'https://cloud-mixfq3elm-hack-club-bot.vercel.app/0____.png'
                }
                className="w-32"
                alt="trumpet"
              />
            </div>
          </div>
        </div>
      </div>
      {/* other trumpets are delayed */}
      <Trumpet bot={40} rot={15} ani="trumpet2" />
      <Trumpet bot={60} rot={-15} ani="trumpet3" />
      <Trumpet bot={30} rot={7} ani="trumpet2" />
      {/* left trumpets */}
      <Trumpet bot={35} rot={-7} ani="trumpet2" flip={true} />
      <Trumpet bot={15} rot={7} ani="trumpet3" flip={true} />
      <Trumpet bot={50} rot={17} ani="trumpet2" flip={true} />
    </>
  )
}

const theFlags = () => {
  return (
    <>
      <Flag rot={15} ani="trumpet2" dur={250 * Math.round(Math.random() * 5)} />
      <Flag rot={15} ani="trumpet2" dur="500" flip={true} />
    </>
  )
}

const SoundButton = () => {
  const [soundState, setSoundState] = useState(false)
  const audioRef = useRef()

  // toggle sound state
  const handleClick = () => {
    setSoundState(!soundState)
  }

  useEffect(() => {
    // play sound if soundState is true
    if (soundState) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [soundState])

  const [musicUrl, setMusicUrl] = useState(musicSamples[0])
  useEffect(() => {
    setMusicUrl(sample(musicSamples))
  }, [])

  return (
    <>
      <audio src={musicUrl} loop ref={audioRef} />
      {soundState ? theTrumpets() : ''}
      {soundState ? theFlags() : ''}
      <div
        className="fixed bottom-3 right-3 cursor-pointer"
        onClick={handleClick}
      >
        <div className="bg-gray-100 border-indigo-500 size-20 rounded-full border-2 flex items-center justify-center text-xl">
          {soundState ? '🔊' : '🔇'}
        </div>
      </div>
    </>
  )
}

export { SoundButton }
