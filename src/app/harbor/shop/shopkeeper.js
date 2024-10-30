import { useState } from "react"

import {Howl} from 'howler';

const bellSoundUrls = [
  "https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/0ding-2-90199_audio.mp4",
  "https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/1ding-3-90200_audio.mp4",
  "https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/2ding-1-106698_audio.mp4",
  "https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/3service-bell-ring-14610_audio.mp4",
  "https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/4bell-98033_audio.mp4",
]
const bellSounds = bellSoundUrls.map(url => new Howl({ src: [url] }))

export const ShopkeeperComponent = () => {
  const [atCounter, setAtCounter] = useState(false)
  const [bellIndex, setBellIndex] = useState(0)
  const [bellClickCount, setBellClickCount] = useState(0)
  const [continuousBellClicks, setContinuousBellClicks] = useState(0)

  const handleServiceBellClick = () => {
    setAtCounter(true)
    setBellIndex(Math.floor(Math.random() * bellSounds.length))
    bellSounds[bellIndex].play()
    setBellClickCount(bellClickCount + 1)
    setContinuousBellClicks(continuousBellClicks + 1)
  }

  return (
    <>
      <div className="cursor-pointer" onClick={handleServiceBellClick}>🛎️</div>
      <div>(ring for service)</div>

      {atCounter && (
        <div className="shopkeeper">
        </div>
      )}
    </>
  )
}
