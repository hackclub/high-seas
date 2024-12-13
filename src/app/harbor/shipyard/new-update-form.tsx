// Import necessary modules and components
import { createShipUpdate } from './ship-utils'
import type { Ship } from '@/app/utils/data'
import { Button } from '@/components/ui/button'
import JSConfetti from 'js-confetti'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getWakaSessions } from '@/app/utils/waka'
import Icon from '@hackclub/icons'
import { MultiSelect } from '@/components/ui/multi-select'

export default function NewUpdateForm({
  shipChain,
  canvasRef,
  closeForm,
  session,
  setShips,
  ships
}: {
  shipChain: Ship[]
  canvasRef: any
  closeForm: any
  session: any
  setShips: any
  ships: Ship[]
}) {
  const [staging, setStaging] = useState(false)
  const [loading, setLoading] = useState(true)
  const confettiRef = useRef<JSConfetti | null>(null)
  const [projectHours, setProjectHours] = useState<number>(0)
  const [projects, setProjects] = useState<
    { key: string; total: number }[] | null
  >(null)
  const [selectedProjects, setSelectedProjects] = useState<
    | [
    {
      key: string
      total: number
    },
  ]
    | null
  >(null)

  const newWakatimeProjects = selectedProjects?.join('$$xXseparatorXx$$') ?? ''
  const prevWakatimeProjects = shipChain[shipChain.length - 1].wakatimeProjectNames?.join('$$xXseparatorXx$$') ?? ''
  let wakatimeProjectNames = prevWakatimeProjects
  if (newWakatimeProjects && newWakatimeProjects !== '') {
    wakatimeProjectNames = prevWakatimeProjects + '$$xXseparatorXx$$' + newWakatimeProjects
  }

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

  // Fetch projects from the API using the Slack ID
  useEffect(() => {
    async function fetchProjects() {
      try {
        if (sessionStorage.getItem('tutorial') === 'true') {
          setProjects([{ key: 'hack-club-site', total: 123 * 60 * 60 }])
        } else {
          const res = await getWakaSessions()
          const shippedShips = ships
            .filter((s) => s.shipStatus !== 'deleted')
            .flatMap((s) => s.wakatimeProjectNames)
          setProjects(
            res.projects.filter(
              (p: { key: string; total: number }) =>
                p.key !== '<<LAST_PROJECT>>' && !shippedShips.includes(p.key),
            ),
          )
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [ships])

  const calculateCreditedTime = useCallback(
    (
      projects: {
        key: string
        total: number
      }[],
      newProjects: string[] | null,
    ): number => {
      const shipChainTotalHours = shipChain.reduce(
        (acc, curr) => (acc += curr.credited_hours ?? 0),
        0,
      )
      console.log({ shipChain, shipChainTotalHours })
      const newProjectsHours = projects.filter((p) =>
        newProjects?.includes(p.key),
      ).reduce((acc, curr) => (acc += curr.total ?? 0), 0)

      const ps = projects.filter((p) =>
        (shipChain[shipChain.length - 1].wakatimeProjectNames || []).includes(p.key),
      )

      if (!ps || ps.length === 0) return 0

      const total = ps.reduce((acc, curr) => (acc += curr.total), 0) + newProjectsHours
      const creditedTime = total / 3600 - shipChainTotalHours
      return Math.round(creditedTime * 1000) / 1000
    },
    [shipChain],
  )

  const fetchAndSetProjectHours = useCallback(async (newProjects: string[] | null) => {
    setLoading(true);
    const res = await fetchWakaSessions();

    if (res && shipChain[0].total_hours) {
      let creditedTime = calculateCreditedTime(res.projects, newProjects);
      console.log('Flow one', { ps: res.projects, creditedTime });

      if (creditedTime < 0) {
        const anyScopeRes = await fetchWakaSessions('any');
        if (anyScopeRes) {
          creditedTime = calculateCreditedTime(anyScopeRes.projects, newProjects);
          console.error('fetchAndSetProjectHours::Flow two', { creditedTime });
        }
      }

      setProjectHours(creditedTime);
    }
    setLoading(false);
  }, [fetchWakaSessions, calculateCreditedTime, shipChain]);

// Use fetchAndSetProjectHours in useEffect
  useEffect(() => {
    fetchAndSetProjectHours(null);
  }, [fetchAndSetProjectHours]);

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

  const projectDropdownList = projects?.map((p: any) => ({
    label: `${p.key} (${(p.total / 60 / 60).toFixed(2)} hrs)`,
    value: p.key,
    icon: () => <Icon glyph="clock" size={24} />,
  }))

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
          maxLength={500}
          required
          className="w-full p-2 rounded bg-white/50"
        />

        {/* Project Dropdown */}
        <div id="project-field">
          <label htmlFor="project" className="leading-0">
            Select Additional Project
          </label>

          {projects ? (
            <MultiSelect
              options={projectDropdownList}
              onValueChange={async (p) => {
                setSelectedProjects(p);
                await fetchAndSetProjectHours(p);
              }}
              defaultValue={[]}
              placeholder="Select projects..."
              variant="inverted"
              maxCount={3}
            />
          ) : (
            <p>Loading projects...</p>
          )}

          {/* Hidden input to include in formData */}
          <input
            type="hidden"
            id="wakatime-project-name"
            name="wakatime_project_name"
            value={wakatimeProjectNames ?? ''}
          />
        </div>

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
