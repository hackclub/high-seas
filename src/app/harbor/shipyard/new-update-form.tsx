// Import necessary modules and components
import { createShipUpdate } from './ship-utils'
import type { Ship } from '@/app/utils/data'
import { Button } from '@/components/ui/button'
import JSConfetti from 'js-confetti'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getWakaSessions } from '@/app/utils/waka'
import Icon from '@hackclub/icons'

export default function NewUpdateForm({
  shipChain,
  canvasRef,
  closeForm,
  session,
  setShips,
}: {
  shipChain: Ship[]
  canvasRef: any
  closeForm: any
  session: any
  setShips: any
}) {
  const [staging, setStaging] = useState(false)
  const [loading, setLoading] = useState(true)
  const confettiRef = useRef<JSConfetti | null>(null)
  const [projectHours, setProjectHours] = useState<number>(0)

  // Initialize confetti on mount
  useEffect(() => {
    confettiRef.current = new JSConfetti({ canvas: canvasRef.current })
  }, [canvasRef.current])

  // Fetch projects from the API using the Slack ID
  const fetchWakaSessions = useCallback(async (scope?: string) => {
    try {
      return await getWakaSessions(scope)
    } catch (error) {
      console.error('Error fetching Waka sessions:', error)
      return null
    }
  }, [])

  const calculateCreditedTime = useCallback(
    (
      projects: {
        key: string
        total: number
      }[],
    ): number => {
      const shipChainTotalHours = shipChain.reduce(
        (acc, curr) => (acc += curr.credited_hours ?? 0),
        0,
      )
      console.log({ shipChain, shipChainTotalHours })

      const ps = projects.filter((p) =>
        (shipChain[0].wakatimeProjectNames || []).includes(p.key),
      )

      if (!ps || ps.length === 0) return 0

      const total = ps.reduce((acc, curr) => (acc += curr.total), 0)
      const creditedTime = total / 3600 - shipChainTotalHours
      return Math.round(creditedTime * 1000) / 1000
    },
    [shipChain],
  )

  useEffect(() => {
    async function fetchAndSetProjectHours() {
      setLoading(true)
      const res = await fetchWakaSessions()

      if (res && shipChain[0].total_hours) {
        let creditedTime = calculateCreditedTime(res.projects)
        console.log('Flow one', { ps: res.projects, creditedTime })

        if (creditedTime < 0) {
          const anyScopeRes = await fetchWakaSessions('any')
          if (anyScopeRes) {
            creditedTime = calculateCreditedTime(anyScopeRes.projects)
            console.error('fetchAndSetProjectHours::Flow two', { creditedTime })
          }
        }

        setProjectHours(creditedTime)
      }
      setLoading(false)
    }

    fetchAndSetProjectHours()
  }, [fetchWakaSessions, calculateCreditedTime, shipChain])

  const handleForm = async (formData: FormData) => {
    setStaging(true)

    if (!shipChain.at(-1)) {
      console.error(
        'shipChain.at(-1) FAILED while trying to ship an update to ship in chain',
        shipChain,
      )
      closeForm()
      setStaging(false)
      return
    }

    const updatedShip = await createShipUpdate(
      shipChain.at(-1)!.id,
      projectHours,
      formData,
    )
    confettiRef.current?.addConfetti()
    closeForm()
    setStaging(false)

    if (setShips) {
      setShips((previousShips: Ship[]) => {
        return [...previousShips, updatedShip]
      })
    } else {
      console.error("Updated a ship but can't setShips bc you didn't pass it.")
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">
        Ship an update to {shipChain[0].title}
      </h1>

      <p className="mb-2">
        You are adding {projectHours <= 0 ? 'no' : projectHours} hours of work
        to this project
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleForm(new FormData(e.target as HTMLFormElement))
        }}
        className="space-y-3"
      >
        <label htmlFor="update_description">Description of the update</label>
        <textarea
          id="update_description"
          name="update_description"
          rows={4}
          cols={50}
          minLength={10}
          required
          className="w-full p-2 rounded bg-white/50"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={staging || loading || projectHours <= 0.5}
        >
          {staging ? (
            <>
              <Icon glyph="attachment" className="animate-spin" />
              Staging!
            </>
          ) : loading ? (
            <>
              <Icon glyph="clock" className="animate-spin p-1" />
              Loading...
            </>
          ) : projectHours > 0.5 ? (
            'Stage my Ship!'
          ) : (
            "You don't have enough hours to ship an update"
          )}
        </Button>
      </form>
    </div>
  )
}
