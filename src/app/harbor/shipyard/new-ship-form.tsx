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

async function checkRepoForPossibleWebsite(repoUrl: string) {
  const response = await fetch('/api/check-repo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl }),
  })
  const data = await response.json()
  return data.hasPossibleWebsite
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
  const [open, setOpen] = useState(false)
  const [isShipUpdate, setIsShipUpdate] = useState(false)
  const [isGithubRepo, setIsGithubRepo] = useState(false)
  const { toast } = useToast()

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
    // // Append the selected project's hours to the form data
    // if (selectedProject) {
    //   formData.append("hours", selectedProject.key.toString());
    // }

    const deploymentUrl = formData.get('deployment_url') as string
    if (
      ['github.com', 'gitlab.com', 'bitbucket.org', 'testflight.com'].some(
        (domain) => deploymentUrl.includes(domain),
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

    const repoUrl = formData.get('repo_url') as string
    const hasPossibleWebsite = await checkRepoForPossibleWebsite(repoUrl)
    if (hasPossibleWebsite) {
      toast({
        title: "Warning",
        description: 'We detected possible website files in your repo. Please submit a hosted demo link using vercel over a Youtube link.',
      })
    }

    const assumedReadmeUrl = await getReadmeFromRepo(repoUrl)    
    if (!!assumedReadmeUrl) {
      formData.set('readme_url', assumedReadmeUrl)
    }

    const isTutorial = sessionStorage?.getItem('tutorial') === 'true'
    if (!isTutorial) {
      await createShip(formData)
    }
    confettiRef.current?.addConfetti()
    closeForm()
    window.location.reload()
    setStaging(false)
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

          {/* <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={!projects}
              >
                {selectedProject
                  ? `${selectedProject.key} (${(selectedProject.total / 60 / 60).toFixed(1)} hrs)`
                  : projects
                    ? "Select project..."
                    : "Loading projects..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-[9998]">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandList>
                  <CommandEmpty className="p-4">
                    <p>
                      {"You don't seem to have any tracked projects."}
                      <br />
                      {"Start coding a project and it'll appear here!"}
                    </p>

                    <img
                      className="mx-auto mt-4"
                      width={128}
                      src="/dino_debugging.svg"
                      alt="a confused dinosaur"
                    />
                  </CommandEmpty>
                  <CommandGroup>
                    {projects &&
                      projects.map((project, idx) => (
                        <CommandItem
                          key={`${project.key}-${idx}`}
                          onSelect={() => {
                            setSelectedProject(project);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProject &&
                                selectedProject.key === project.key
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {project.key} ({(project.total / 60 / 60).toFixed(1)}{" "}
                          hrs)
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover> */}

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
            className="w-full p-2 border rounded"
            onChange={({ target }) =>
              setIsGithubRepo(target.value.includes('github.com'))
            }
          />
        </div>

        {!isGithubRepo && (
          <div id="readme-field">
            <label htmlFor="readme_url">README URL</label>
            <input
              type="url"
              id="readme_url"
              name="readme_url"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <div id="deployment-field">
          <label htmlFor="deployment_url">
            Demo Link (Project / Video URL)
          </label>
          <input
            type="url"
            id="deployment_url"
            name="deployment_url"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div id="screenshot-field">
          <label htmlFor="screenshot_url">
            Screenshot URL
            <br />
            <span className="text-xs opacity-50">
              You can upload to{' '}
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
            className="w-full p-2 border rounded"
          />
        </div>

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
