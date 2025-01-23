import { useEffect, useState } from 'react'

import { Howl } from 'howler'
import { yap } from '../../../../lib/yap'
import { shopIcons, bound } from '../../../../lib/flavor'

import { transcript } from '../../../../lib/transcript'
import { useEventEmitter } from '../../../../lib/useEventEmitter'
import { Button } from '@/components/ui/button'

const bellSoundUrls = [
  'https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/0ding-2-90199_audio.mp4',
  'https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/1ding-3-90200_audio.mp4',
  'https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/2ding-1-106698_audio.mp4',
  'https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/3service-bell-ring-14610_audio.mp4',
  'https://cloud-dx9y4rk8f-hack-club-bot.vercel.app/4bell-98033_audio.mp4',
]
const bellSounds = bellSoundUrls.map((url) => new Howl({ src: [url] }))

export const ShopkeeperComponent = ({ balance, cursed }) => {
  const [atCounter, setAtCounter] = useState(false)
  const [bellIndex, setBellIndex] = useState(0)
  const [bellClickCount, setBellClickCount] = useState(0)
  const [selfClickCount, setSelfClickCount] = useState(0)
  const [continuousBellClicks, setContinuousBellClicks] = useState(0)
  const [shopkeeperMsg, setShopkeeperMsg] = useState('')
  const [shopkeeperImg, setShopkeeperImg] = useState(shopIcons.scallywag)
  const [interactionBusy, setInteractionBusy] = useState(false)
  const { on, off } = useEventEmitter()
  const [buyButton, setBuyButton] = useState()
  const [bellButton, setBellButton] = useState(false)
  const [juiceButton, setJuiceButton] = useState(false)

  useEffect(() => {
    const handleEvent = (event) => {
      if (event.detail?.interaction) {
        handleInteraction(event.detail.interaction)
      }
    }

    if (atCounter) {
      on('shopkeeper', handleEvent)
    } else {
      off('shopkeeper', handleEvent)
    }

    return () => {
      off('shopkeeper', handleEvent)
    }
  }, [on, off, atCounter])

  let handleInteraction = async (interaction, clearPrevious = true) => {
    if (interactionBusy) {
      if (process.env.NODE_ENV === 'development') {
        console.log({ interactionBusy })
      }
      return
    }
    setInteractionBusy(true)
    if (clearPrevious) {
      setShopkeeperMsg('')
      setBuyButton()
      setJuiceButton()
      setBellButton(false)
    }
    let speed
    console.log('handling interaction', interaction)
    for (const action of interaction.split('|')) {
      const [verb, ...arg] = action.split(':')

      if (process.env.NODE_ENV === 'development') {
        console.log('processing', verb, arg)
      }
      switch (verb) {
        case 'icon':
          await setShopkeeperImg(shopIcons[arg] || arg)
          break
        case 'speed':
          if (arg[0]) {
            speed = parseFloat(arg[0])
          } else {
            speed = undefined
          }
          break
        case 'buy':
          if (arg[0]) {
            await setBuyButton(arg[0])
          } else {
            await setBuyButton()
          }
          break
        case 'bellButton':
          if (arg[0]) {
            await setBellButton(arg[0])
          } else {
            await setBellButton()
          }
          break
        case 'juiceButton':
          if (arg[0]) {
            await setJuiceButton(arg[0])
          } else {
            await setJuiceButton()
          }
          break
        case 'pause':
          if (arg[0]) {
            await new Promise((resolve) =>
              setTimeout(resolve, parseFloat(arg[0])),
            )
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
          break
        default:
          await new Promise((resolve) => {
            const yapOptions = {
              letterCallback: ({ letter }) =>
                setShopkeeperMsg((s) => s + letter),
              endCallback: resolve,
            }
            if (speed) {
              yapOptions.baseRate = speed
            }
            yap(action, yapOptions)
          })
          break
      }
    }
    setInteractionBusy(false)
  }

  const handleServiceBellClick = async () => {
    setBellIndex(Math.floor(Math.random() * bellSounds.length))
    setBellClickCount((prev) => prev + 1)
    setContinuousBellClicks((prev) => prev + 1)
    bellSounds[bellIndex].play()
    setAtCounter(true)
    // await new Promise(r => setTimeout(r, 1000))
    if (continuousBellClicks > 7) {
      await handleInteraction(transcript('tooManyBells'))
    } else if (continuousBellClicks == 7) {
      await handleInteraction(transcript('bellClicker'))
    } else if (continuousBellClicks > 5) {
      await handleInteraction(transcript('tooManyBells'))
    } else if (continuousBellClicks > 3) {
      await handleInteraction(transcript('lotsOfBells'))
    } else if (cursed) {
      const greetingSliced = transcript('greetings')
        .split(' ')
        .slice(0, bound(Math.random() * 10, 3, 15))
        .join(' ')
      await handleInteraction(
        greetingSliced +
          '-- wait... ' +
          transcript('cursed') +
          ' ' +
          transcript('getout'),
      )
    } else if (balance == 0) {
      await handleInteraction(
        transcript('greetings') +
          ' ' +
          transcript('noMoney') +
          ' ' +
          transcript('getout'),
      )
      // setAtCounter(false)
    } else if (continuousBellClicks > 1) {
      await handleInteraction(transcript('help'))
    } else {
      if (bellClickCount == 0) {
        await handleInteraction(
          transcript('greetings') +
            " just click on anything you're interested in!",
        )
      } else {
        await handleInteraction(transcript('greetings'))
      }
    }
  }

  const handleSelfClick = async () => {
    setSelfClickCount((prev) => prev + 1)
    if (selfClickCount == 2) {
      await handleInteraction(transcript('selfClickBuy'))
    } else {
      const msg = transcript('selfClick')
      await handleInteraction(msg)
      if (msg.includes('scurvy') && selfClickCount % 3 == 0) {
        await handleInteraction(transcript('juice'), false)
      }
    }
  }

  const containerStyles = {
    zIndex: 999, // over the page, under the sound-button
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    color: 'white',
  }

  const innerPaddingStyles = {
    margin: '0 auto',
    maxWidth: '32em',
    display: 'flex',
    flexDirection: 'row',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(0.3em)',
    paddingTop: '1em',
  }

  const imgStyles = {
    maxWidth: '10em',
  }

  return (
    <>
      <div
        className="cursor-pointer text-center mt-5"
        onClick={handleServiceBellClick}
      >
        🛎️
      </div>
      <div className="text-center">(ring for service)</div>

      <style jsx>
        {`
          @keyframes talking {
            from {
              transform: scale(1.01, 0.99) translateY(2%);
            }
            to {
              transform: scale(0.99, 1.01) translateY(0%);
            }
          }

          @keyframes idle {
            from {
              transform: translateY(0%);
            }
            to {
              transform: translateY(2%);
            }
          }

          .shopkeeper-idling {
            animation: idle 2s infinite alternate;
            filter: contrast(60%);
          }

          .shopkeeper-talking {
            animation: talking 0.2s infinite alternate;
            filter: contrast(100%);
          }
        `}
      </style>

      {atCounter && (
        <div style={containerStyles}>
          <div style={innerPaddingStyles}>
            <div id="shopkeeper-img">
              <img
                src={shopkeeperImg}
                style={imgStyles}
                onClick={handleSelfClick}
                className={
                  interactionBusy ? 'shopkeeper-talking' : 'shopkeeper-idling'
                }
              />
            </div>
            <div id="shopkeeper-msg">
              {shopkeeperMsg}
              {buyButton && <BuyButton itemId={buyButton} />}
              {bellButton && <BellButton />}
              {juiceButton && <JuiceButton />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const BuyButton = ({ itemId }) => {
  return (
    <form
      action={`/api/buy/${itemId}`}
      className="w-full text-center animate-pulse"
    >
      <Button className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 m-2 rounded transition-colors duration-200 text-3xl enchanted">
        Buy
      </Button>
    </form>
  )
}

const BellButton = () => {
  return (
    <a href="https://maxwofford.com/clicker">
      <Button className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 m-2 rounded transition-colors duration-200 text-3xl enchanted">
        Take
      </Button>
    </a>
  )
}

const JuiceButton = () => {
  return (
    <a href="https://juice.hackclub.com">
      <Button className="bg-black hover:bg-orange-800 text-white font-semibold py-2 px-4 m-2 rounded transition-colors duration-200 text-3xl enchanted">
        Take (on the house)
      </Button>
    </a>
  )
}
