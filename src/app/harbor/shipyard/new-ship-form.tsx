// Import necessary modules and components
import React from 'react'
import Link from 'next/link'
import { createShip, Ship } from './ship-utils'
import { Button } from '@/components/ui/button'
import JSConfetti from 'js-confetti'
import { useEffect, useRef, useState } from 'react'
import { getWakaSessions } from '@/app/utils/waka'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import Icon from '@hackclub/icons'
import { MultiSelect } from '../../../components/ui/multi-select'
import { SingleSelect } from '@/components/ui/single-select'

async function testReadmeLink(url: string) {
  const response = await fetch(url)
  if (response.status !== 200) {
    return false
  }
  const responseText = await response.text()
  if (!responseText || responseText === '404: Not Found') {
    return false
  }
  return true
}

async function getReadmeFromRepo(url: string) {
  if (!url.includes('github.com')) {
    return null
  }
  // https://api.github.com/repos/OWNER/REPO/readme
  const readmeUrl = url.replace(
    /https:\/\/github.com\/(.*?)\/(.*?)\/?$/,
    'https://api.github.com/repos/$1/$2/readme',
  )
  const readmeData = await fetch(readmeUrl).then((d) => d.json())
  const readmeURI = readmeData.download_url
  return (await testReadmeLink(readmeURI)) ? readmeURI : null
}

export default function NewShipForm({
  ships,
  canvasRef,
  closeForm,
  session,
  ...props
}: {
  ships: Ship[]
  canvasRef: any
  closeForm: any
  session: any
}) {
  const [staging, setStaging] = useState(false)
  const confettiRef = useRef<JSConfetti | null>(null)
  const [usedRepos, setUsedRepos] = useState<string[]>([])
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
  const [isShipUpdate, setIsShipUpdate] = useState(false)
  const { toast } = useToast()
  const [yswsType, setYswsType] = useState<string>('none')
  const yswsTypeOptions = [
    { label: 'none', value: 'none' },
    { label: 'Onboard', value: 'onboard' },
    { label: 'Blot', value: 'blot' },
    { label: 'Sprig', value: 'sprig' },
    { label: 'Bin', value: 'bin' },
    { label: 'Hackpad', value: 'hackpad' },
    { label: 'LLM', value: 'llm' },
    { label: 'Boba Drops', value: 'boba' },
    { label: 'Cascade', value: 'cascade' },
    { label: 'Retrospect', value: 'retrospect' },
    { label: 'Hackcraft', value: 'hackcraft' },
    { label: 'Cider', value: 'cider' },
    { label: 'Browser buddy', value: 'browser buddy' },
    { label: 'Cargo Cult', value: 'cargo-cult' },
    { label: 'Fraps', value: 'fraps' },
    { label: 'Riceathon', value: 'riceathon' },
    { label: 'Counterspell', value: 'counterspell' },
    { label: 'Anchor', value: 'anchor' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Asylum', value: 'asylum' },
  ]

  // Initialize confetti on mount
  useEffect(() => {
    confettiRef.current = new JSConfetti({ canvas: canvasRef.current })
  }, [canvasRef.current])

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

  const handleForm = async (formData: FormData) => {
    setStaging(true)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (selectedProjects === null || selectedProjects?.length === 0) {
      toast({
        title: 'Select a project',
        description: 'Please select at least one Hackatime project!',
      })
      setStaging(false)
      return
    }

    const deploymentUrl = formData.get('deployment_url') as string
    if (
      ['github.com', 'gitlab.com', 'bitbucket.org'].some((domain) =>
        deploymentUrl.includes(domain),
      )
    ) {
      toast({
        title: "That's not a demo link!",
        description:
          'Submit a link to a deployed project or a video demo of what your project is instead!',
      })
      setStaging(false)
      return
    }

    if (deploymentUrl.includes('drive.google')) {
      toast({
        title: "Drive links aren't allowed",
        description:
          "Drive links aren't allowed. Link to a deployed project directly, or if you can't upload your video somewhere else",
      })
      setStaging(false)
      return
    }

    const repoUrl = formData.get('repo_url') as string
    if (usedRepos.includes(repoUrl)) {
      toast({
        title: 'You already submitted a project from this repo!',
        description:
          "If you're shipping an update to a project, use the 'ship an update' button instead.",
      })
    }

    const screenshotUrl = formData.get('screenshot_url') as string
    const readmeUrl = formData.get('readme_url') as string
    const [screenshotRes, readmeRes] = await Promise.all([
      fetch(screenshotUrl).catch((e) => console.error(e)),
      fetch(readmeUrl).catch((e) => console.error(e)),
    ])
    if (!screenshotRes) {
      toast({
        title: "We couldn't load your screenshot link!",
        description: 'Try #cdn instead!',
      })
      setStaging(false)
      return
    }
    if (!screenshotRes?.headers?.get('content-type')?.startsWith('image')) {
      toast({
        title: "That's not an image!",
        description: 'Submit a link to an image of your project instead!',
      })
      setStaging(false)
      return
    }

    if (screenshotUrl.includes('cdn.discordapp.com')) {
      toast({
        title: "That screenshot doesn't work!",
        description:
          'Discord links are temporary, please host your files in #cdn!',
      })
      setStaging(false)
      return
    }

    if (!screenshotUrl.startsWith('https://')) {
      toast({
        title: "That screenshot doesn't work!",
        description:
          'Please use http or https links (no data urls), please host your files in #cdn!',
      })
      setStaging(false)
      return
    }
    if (
      deploymentUrl.includes('localhost') ||
      deploymentUrl.includes('127.0.0.1')
    ) {
      toast({
        title: "That's not a demo link!",
        description:
          'Please make sure your link isnt a local link.. Please submit a deployed link instead!',
      })
      setStaging(false)
      return
    }

    if (readmeUrl.includes('github.com')) {
      toast({
        title: "This isn't a markdown link!",
        description:
          'Submit a link to the raw README file in your repo instead!',
      })
      setStaging(false)
      return
    }

    if (
      readmeRes.status !== 200 ||
      !['text/plain', 'text/markdown'].includes(
        readmeRes?.headers?.get('content-type')?.split(';')[0] || '',
      )
    ) {
      toast({
        title: "That's not a valid README link!",
        description: 'Submit a link to a README file in your repo instead!',
      })
      setStaging(false)
      return
    }

    formData.append('yswsType', yswsType)

    const isTutorial = sessionStorage?.getItem('tutorial') === 'true'
    confettiRef.current?.addConfetti()
    closeForm()
    if (isTutorial) {
      window.location.reload()
    } else {
      const _newShip = await createShip(formData, false)
      setStaging(false)
    }

    // ideally we don't have to reload the page here.
    window.location.reload()
  }

  const projectDropdownList = projects?.map((p: any) => ({
    label: `${p.key} (${(p.total / 60 / 60).toFixed(2)} hrs)`,
    value: p.key,
    icon: () => <Icon glyph="clock" size={24} />,
  }))

  return (
    <div
      {...props}
      style={{ maxHeight: '75vh', overflowY: 'auto' }}
      id="new-ship-form-container-card"
    >
      <h1 className="text-2xl font-bold mb-4">
        {isShipUpdate ? 'Update a' : 'New'} Ship
      </h1>
      <form action={handleForm} className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isShipUpdate"
            id="isShipUpdate"
            onChange={({ target }) => setIsShipUpdate(target.checked)}
          />
          <label htmlFor="isShipUpdate" className="select-none">
            This is an update to an existing project
            <br />
            <span className="text-xs">
              Only select this if {"it's"} a project you started before High
              Seas and {"haven't"} submitted before.
              <br />
              For example: maybe you already built a game, and you want to ship
              an amazing update to it! Click this box and describe the update.
              If you {"don't"} understand this, please ask in{' '}
              <Link
                className="underline"
                href="https://hackclub.slack.com/archives/C07PZNMBPBN"
              >
                #high-seas-help
              </Link>
              !
            </span>
          </label>
        </div>

        <AnimatePresence>
          {isShipUpdate ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'fit-content', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <label htmlFor="updateDescription">
                Description of the update
              </label>
              <textarea
                id="updateDescription"
                name="updateDescription"
                rows={4}
                cols={50}
                minLength={10}
                maxLength={500}
                required
                className="w-full p-2 border rounded"
              ></textarea>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div id="title-field">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            maxLength={100}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Project Dropdown */}
        <div id="project-field">
          <label htmlFor="project" className="leading-0">
            Select Project
          </label>

          {projects ? (
            <MultiSelect
              options={projectDropdownList}
              onValueChange={(p) => setSelectedProjects(p)}
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
            value={selectedProjects?.join('$$xXseparatorXx$$') ?? ''}
          />
        </div>

        <div id="repo-field">
          <label htmlFor="repo_url">Repo URL</label>
          <input
            type="url"
            id="repo_url"
            name="repo_url"
            required
            maxLength={160}
            className="w-full p-2 border rounded"
            onChange={({ target }) => {
              getReadmeFromRepo(target.value).then((readme) => {
                if (readme && document) {
                  const readmeEl = document.getElementById('readme_url')
                  if (readmeEl) {
                    readmeEl.setAttribute('value', readme)
                  }
                }
              })
            }}
          />
        </div>

        <div id="readme-field">
          <label htmlFor="readme_url">README URL</label>
          <input
            type="url"
            id="readme_url"
            name="readme_url"
            maxLength={600}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div id="deployment-field">
          <label htmlFor="deployment_url">
            Demo Link (Project / Video URL)
          </label>
          <input
            type="url"
            id="deployment_url"
            name="deployment_url"
            maxLength={200}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div id="screenshot-field">
          <label htmlFor="screenshot_url">
            Screenshot URL
            <br />
            <span className="text-xs opacity-50">
              No dataURLs please. You can upload to{' '}
              <Link
                className="underline"
                href="https://hackclub.slack.com/archives/C016DEDUL87"
                target="_blank"
                rel="noopener noreferrer"
              >
                #cdn
              </Link>{' '}
              if you like!
            </span>
          </label>
          <input
            type="url"
            id="screenshot_url"
            name="screenshot_url"
            required
            maxLength={300}
            className="w-full p-2 border rounded"
          />
        </div>

        {sessionStorage?.getItem('tutorial') !== 'true' && (
          <div id="yswsType-field">
            <label htmlFor="yswsType">
              Was this created for a Hack Club program? (optional) <br />
            </label>
            <span className="text-xs opacity-50">
              This doesn't affect your submission, it's just feedback for us!
            </span>
            <SingleSelect
              options={yswsTypeOptions}
              onValueChange={(t) => setYswsType(t)}
              defaultValue={'none'}
              variant="inverted"
            />
          </div>
        )}

        <Button type="submit" disabled={staging} id="new-ship-submit">
          {staging ? (
            <>
              <Icon glyph="more" />
              Staging!
            </>
          ) : (
            'Submit as a draft'
          )}
        </Button>
        <p className="text-xs opacity-50">
          Drafting a Ship means you can preview it before sending it off to be
          voted on!
        </p>
      </form>
    </div>
  )
}
