import { useState, useEffect } from 'react'
import JaggedCardSmall from '@/components/jagged-card-small'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const dateEnd = new Date('2025-02-03T05:00:00Z').getTime()
const formatTime = (distance: number) => {
  const hours = Math.floor(distance / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  } else if (minutes > 0) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  } else {
    return `${String(seconds).padStart(2, '0')}`
  }
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState('00:00:00')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = dateEnd - now

      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft('00:00:00')
        return
      }

      setTimeLeft(formatTime(distance))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return dateEnd - new Date().getTime() > 100 * 60 * 60 * 1000 ? (
    <></>
  ) : (
    <JaggedCardSmall bgColor="#efefef" shadow={true} className="text-white">
      <div className="text-center">
        <h2 className="text-xl">
          {dateEnd - new Date().getTime() > 0 ? (
            <>Time Remaining</>
          ) : (
            <>Ended.</>
          )}
        </h2>
        <h1
          className={`font-black font-mono ${dateEnd - new Date().getTime() < 60 * 60 * 1000 ? 'text-6xl' : 'text-5xl'}`}
        >
          {dateEnd - new Date().getTime() > 0 ? (
            <>{timeLeft}</>
          ) : (
            <>High Seas is over!</>
          )}
        </h1>

        <div className="mt-4">
          {dateEnd - new Date().getTime() > 0 ? (
            <>
              Arrrrr, you'd better{' '}
              <Link href="/shipyard">
                <Button
                  variant={'link'}
                  className="text-white mx-0 px-0 text-base"
                >
                  ship all your ships
                </Button>
              </Link>{' '}
              before the time runs out!
            </>
          ) : (
            <>Arrr, thank you all for competing, you were worthy pirates!</>
          )}
        </div>
      </div>
    </JaggedCardSmall>
  )
}
