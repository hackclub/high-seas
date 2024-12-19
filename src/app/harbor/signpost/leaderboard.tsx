import { Button } from '@/components/ui/button'
import Icon from '@hackclub/icons'
import { useEffect, useState } from 'react'
import {
  getLeaderboardParticipating,
  reportLeaderboardParticipating,
} from '@/app/utils/airtable'

export default function LeaderboardOptIn() {
  const [optedIn, setOptedIn] = useState(false)
  const [inProgress, setInProgress] = useState(false)

  useEffect(() => {
    async function fetchParticipating() {
      setInProgress(true)
      const participating = await getLeaderboardParticipating()
      setOptedIn(participating ?? false)
      setInProgress(false)
    }
    fetchParticipating()
  }, [])

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="mt-8 font-heading text-2xl font-bold mb-4 text-center">
        Want to be on the leaderboard?
      </h2>

      <p className="pb-4">
        If you would like to be on the leaderboard then please click the button
        below to opt in!
      </p>

      <p className="pb-4">
        By opting in you agree to have your name, slackid, and doubloon count
        displayed on the leaderboard. You can view the leaderboard at any time
        by going to{' '}
        <a
          href="https://airtable.com/appTeNFYcUiYfGcR6/shro4hnLq63fT8psX"
          className="text-cyan-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          this link
        </a>
        . You can opt out at any time by clicking the button again.
      </p>

      <Button
        variant={optedIn ? 'destructive' : 'default'}
        disabled={inProgress}
        onClick={async () => {
          setInProgress(true)
          await reportLeaderboardParticipating(!optedIn)
          setOptedIn(!optedIn)
          setInProgress(false)
        }}
      >
        {inProgress ? (
          optedIn ? (
            <>
              <Icon glyph="delete" className="animate-spin" />
              Destroying Records
            </>
          ) : (
            <>
              <Icon glyph="bolt" className="animate-spin" />
              Scribbling
            </>
          )
        ) : optedIn ? (
          'Remove me plz'
        ) : (
          "I'm In!"
        )}
      </Button>
    </div>
  )
}
