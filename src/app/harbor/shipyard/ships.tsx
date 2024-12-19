import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { stagedToShipped } from './ship-utils'
import type { Ship } from '@/app/utils/data'
import Image from 'next/image'
import Icon from '@hackclub/icons'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { markdownComponents } from '@/components/markdown'
import { Button, buttonVariants } from '@/components/ui/button'
import NewShipForm from './new-ship-form'
import EditShipForm from './edit-ship-form'
import { getSession, HsSession } from '@/app/utils/auth'
import Link from 'next/link'
import TimeAgo from 'javascript-time-ago'
import ShipPillCluster from '@/components/ui/ship-pill-cluster'
import NoImgDino from '/public/no-img-dino.png'
import NoImgBanner from '/public/no-img-banner.png'
import ReadmeHelperImg from '/public/readme-helper.png'
import NewUpdateForm from './new-update-form'
import Modal from '../../../components/ui/modal'
import RepoLink from '@/components/ui/repo_link'
import { EditableShipFields } from '../../utils/data'
import ThinkingDino from '/public/thinking.png'

export default function Ships({
  ships = [],
  bareShips = false,
  setShips,
}: {
  ships: Ship[]
  bareShips: boolean
  setShips: any
}) {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null)
  const [previousSelectedShip, setPreviousSelectedShip] = useState<Ship | null>(
    null,
  )
  const [updateChainExpanded, setUpdateChainExpanded] = useState(false)
  const [readmeText, setReadmeText] = useState<string | null>(null)
  const [newShipVisible, setNewShipVisible] = useState(false)
  const [newUpdateShip, setNewUpdateShip] = useState<Ship | null>(null)
  const [session, setSession] = useState<HsSession | null>(null)
  const [isEditingShip, setIsEditingShip] = useState(false)
  const [errorModal, setErrorModal] = useState<string>()
  const [shipToShip, setShipToShip] = useState<Ship | null>(null)
  const [shipModal, setShipModal] = useState<boolean>(false)
  const canvasRef = useRef(null)

  const [isShipping, setIsShipping] = useState(false)
  const [shipChains, setShipChains] = useState<Map<string, Ship[]>>()

  const timeAgo = new TimeAgo('en-US')

  useEffect(() => {
    getSession().then((sesh) => setSession(sesh))
  }, [])

  useEffect(() => {
    setSelectedShip((s: Ship | null) => {
      if (!s) return null
      return ships.find((x) => x.id === s.id) || null
    })
  }, [ships])

  useEffect(() => {
    // I.e. if the user has just edited a ship
    if (previousSelectedShip && selectedShip) return

    // Only invalidate the README text when you go from <<ship selected>> to <<no ship selected>>
    if (!selectedShip) {
      setReadmeText(null)
      setIsEditingShip(false)
    }

    if (selectedShip) {
      fetchReadme()
    }

    setPreviousSelectedShip(selectedShip)
  }, [selectedShip])

  const fetchReadme = async () => {
    if (selectedShip && !readmeText) {
      try {
        const text = await fetch(selectedShip.readmeUrl).then((d) => d.text())
        setReadmeText(text)
      } catch (error) {
        console.error('Failed to fetch README:', error)
        setReadmeText('?')
      }
    }
  }

  const stagedShips = useMemo(
    () => ships.filter((ship: Ship) => ship.shipStatus === 'staged'),
    [ships],
  )

  useEffect(() => {
    const shipUpdateChain = new Map<string, Ship[]>()

    console.log(ships.sort((a, b) => a.autonumber - b.autonumber))

    ships
      .sort((a, b) => a.autonumber - b.autonumber)
      .forEach((ship) => {
        if (!ship.reshippedFromId) {
          // If the ship is a root ship, start a new chain
          shipUpdateChain.set(ship.id, [ship])
        } else {
          // If the ship has a parent, find the chain by finding the HEAD ship with id ship.reshippedFromId
          //const targetChain = shipUpdateChain.iter().map(|chain: Ship[]| chain[-1].id === ship.reshippedFromId) // look at the beautiful pseudocode
          for (const [chainId, chain] of shipUpdateChain[Symbol.iterator]()) {
            if (chain.at(-1)!.id === ship.reshippedFromId) {
              shipUpdateChain.set(chainId, [...chain, ship])
              break
            }
          }
        }
      })

    setShipChains(shipUpdateChain)
  }, [ships])

  function getChainFromAnyId(id?: string) {
    if (!id) return

    for (const [_, chain] of shipChains?.[Symbol.iterator]() ?? []) {
      if (chain.map((s: Ship) => s.id).includes(id)) return chain
    }
  }

  async function tryToShip(s: Ship) {
    console.log('Shipping', s)

    try {
      setIsShipping(true)
      const { error } = await stagedToShipped(s, ships)
      if (error) {
        setErrorModal(String(error))
      } else {
        location.reload()
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorModal(err.message)
      }
    } finally {
      setIsShipping(false)
    }
  }

  const selectedShipChain = selectedShip
    ? shipChains?.get(selectedShip.id)
    : undefined

  const shippedShips = shipChains
    ? Object.values(Object.fromEntries(shipChains)).filter(
        (ships: Ship[]) => ships[0].shipStatus === 'shipped',
      )
    : []

  const SingleShip = ({
    s,
    id,
    setNewShipVisible,
  }: {
    s: Ship
    id: string
    setNewShipVisible: any
  }) => (
    <div
      key={s.id}
      id={id}
      onClick={() => setSelectedShip(s)}
      className="cursor-pointer"
    >
      <Card className="flex flex-col sm:gap-2 sm:flex-row items-start sm:items-center p-4 hover:bg-gray-100 transition-colors duration-200">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 relative mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
            <img
              src={s.screenshotUrl}
              alt={`Screenshot of ${s.title}`}
              className="object-cover w-full h-full absolute top-0 left-0 rounded"
              onError={({ target }) => {
                target.src = NoImgDino.src
              }}
            />
          </div>
          <h2 className="text-xl font-semibold text-left mb-2 sm:hidden block">
            {s.title}
          </h2>
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-semibold text-left mb-2 sm:block hidden">
            {s.title}
          </h2>

          <div className="flex flex-wrap items-start gap-2 text-sm">
            <ShipPillCluster
              chain={s.shipType === 'project' ? getChainFromAnyId(s.id) : [s]}
            />
          </div>
        </div>

        {bareShips ? null : (
          <div className="mt-4 sm:mt-0 sm:ml-auto">
            {s.shipStatus === 'staged' ? (
              <>
                <Button
                  id="ship-ship"
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (sessionStorage.getItem('tutorial') === 'true') {
                      await tryToShip(s)
                    } else {
                      setShipToShip(s)
                      setShipModal(true)
                    }
                  }}
                  disabled={isShipping}
                >
                  {isShipping
                    ? 'Shipping...'
                    : s.shipType === 'project'
                      ? 'SHIP SHIP!'
                      : 'SHIP UPDATE!'}
                </Button>

                <Modal isOpen={shipModal} close={() => setShipModal(false)}>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <h2 className="text-3xl font-bold text-center">
                      Confirm Shipping
                    </h2>
                    <p className="text-xl mt-5 text-center">
                      Are you sure you want to ship {s.title}?
                    </p>
                    <p className="mt-3 text-center">
                      Keep in mind that this can't be reverted! <br /> Your ship
                      will start getting into matchups.
                    </p>
                    <div className="flex justify-center">
                      <Image src={ThinkingDino} alt="Thinking Dino" />
                    </div>
                    <div className="flex justify-end mt-5">
                      <Button
                        onClick={() => setShipModal(false)}
                        className="mr-5"
                      >
                        Go back
                      </Button>

                      <Button
                        onClick={async () => {
                          if (shipToShip) {
                            await tryToShip(shipToShip)
                          }
                          setShipModal(false)
                        }}
                        disabled={isShipping}
                      >
                        {isShipping ? 'Shipping...' : 'Yes, ship it'}
                      </Button>
                    </div>
                  </div>
                </Modal>
              </>
            ) : s.paidOut ? (
              !stagedShips.find(
                (stagedShip) =>
                  stagedShip.wakatimeProjectNames.join(',') ===
                  s.wakatimeProjectNames.join(','),
              ) ? (
                <Button
                  onClick={async (e) => {
                    e.stopPropagation()
                    console.log('Shipping an update...', s)
                    setNewUpdateShip(s)
                  }}
                >
                  Ship an update!
                </Button>
              ) : (
                <p className="opacity-50 text-sm">Pending draft update!</p>
              )
            ) : (
              <p>Awaiting payout</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed w-screen left-0 top-0 pointer-events-none"
      />

      {bareShips ? null : (
        <motion.div
          className="w-fit mx-auto mb-0 mt-3"
          whileHover={{ rotate: '-5deg', scale: 1.02 }}
        >
          <Button
            className="text-xl text-white"
            style={{ background: '#D236E2' }}
            id="start-ship-draft"
            onClick={() => setNewShipVisible(true)}
          >
            Draft a new Ship!
          </Button>
        </motion.div>
      )}

      {stagedShips.length === 0 ? null : (
        <div className={`w-full mt-8`}>
          {bareShips ? null : (
            <h2 className="text-center text-2xl mb-2 text-blue-500">Drafts</h2>
          )}

          <div id="staged-ships-container" className="space-y-4">
            {/* If the ship has a reshippedFromId, we're going to fill in the editable fields from the root ship. */}
            {stagedShips.map((ship: Ship, idx: number) => {
              const stagedShipParent = getChainFromAnyId(ship.id)

              const editableFields: EditableShipFields = {
                title: stagedShipParent?.[0].title,
                repoUrl: stagedShipParent?.[0].repoUrl,
                deploymentUrl: stagedShipParent?.[0].deploymentUrl,
                readmeUrl: stagedShipParent?.[0].readmeUrl,
                screenshotUrl: stagedShipParent?.[0].screenshotUrl,
              }

              return (
                <SingleShip
                  s={
                    ship.reshippedFromId && stagedShipParent
                      ? {
                          ...ship,
                          ...editableFields,
                        }
                      : ship
                  }
                  key={ship.id}
                  id={`staged-ship-${idx}`}
                  setNewShipVisible={setNewShipVisible}
                />
              )
            })}
          </div>
        </div>
      )}

      <div className="w-full relative">
        {shipChains && shippedShips.length > 0 ? (
          <div className={`space-y-4 ${bareShips ? '' : 'mt-8'}`}>
            {bareShips ? null : (
              <h2 className="text-center text-2xl text-blue-500">
                Shipped Ships
              </h2>
            )}

            {shippedShips.map((ships: Ship[], idx: number) => (
              <SingleShip
                s={ships[0]}
                key={ships[0].id}
                id={`shipped-ship-${idx}-${ships[0].shipStatus}`}
                setNewShipVisible={setNewShipVisible}
              />
            ))}
          </div>
        ) : null}

        {shipChains?.size === 0 ? (
          <>
            <div className="text-white mx-auto w-fit flex absolute -left-28 right-0 -top-28 pointer-events-none">
              <img src="/curly-arrow.svg" alt="" width="64" />
              <div className="flex flex-col justify-between">
                <p />
                <p className="-translate-x-3 translate-y-2">
                  Ship your first project!
                </p>
              </div>
            </div>
            <div className="mt-24" />
          </>
        ) : null}
      </div>

      <Modal
        isOpen={newShipVisible && session}
        close={() => setNewShipVisible(false)}
      >
        <NewShipForm
          ships={ships}
          canvasRef={canvasRef}
          closeForm={() => setNewShipVisible(false)}
          session={session}
        />
      </Modal>

      <Modal
        isOpen={getChainFromAnyId(newUpdateShip?.id) && session}
        close={() => setNewUpdateShip(null)}
      >
        <NewUpdateForm
          shipChain={getChainFromAnyId(newUpdateShip?.id)!}
          canvasRef={canvasRef}
          closeForm={() => setNewUpdateShip(null)}
          setShips={setShips}
          session={session}
        />
      </Modal>

      <Modal
        isOpen={!!selectedShip}
        close={() => setSelectedShip(null)}
        hideCloseButton={false}
      >
        <div
          className="relative w-full max-w-2xl"
          style={{
            maxHeight: '75vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-48">
            <Image
              src={selectedShip?.screenshotUrl}
              style={{
                maskImage:
                  'linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))',
              }}
              alt={`Screenshot of ${selectedShip?.title}`}
              className="object-cover max-w-full rounded"
              fill={true}
              priority
              unoptimized
              sizes="4rem"
              onError={({ target }) => {
                target.src = NoImgBanner.src
              }}
            />
          </div>

          <div className=" flex-grow pt-32" id="selected-ship-card">
            <div className="relative">
              <h2 className="text-3xl font-bold">{selectedShip?.title}</h2>
              <p className="opacity-75">
                {selectedShip?.wakatimeProjectNames ? (
                  `Wakatime project name: ${selectedShip?.wakatimeProjectNames}`
                ) : (
                  <div className="flex items-center gap-1">
                    <Icon glyph="important" />
                    No Wakatime project name!
                  </div>
                )}
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <div className="flex flex-row gap-3 h-12">
                  <Link
                    id="selected-ship-play-button"
                    className="flex items-center flex-grow"
                    target="_blank"
                    href={selectedShip?.deploymentUrl || '#'}
                    prefetch={false}
                  >
                    <Button
                      className="w-full h-full text-lg"
                      disabled={!selectedShip?.deploymentUrl}
                    >
                      Play
                      <Icon glyph="view-forward" />
                    </Button>
                  </Link>
                  <RepoLink repo={selectedShip?.repoUrl} />

                  <Button
                    id="selected-ship-edit-button"
                    className={`${buttonVariants({
                      variant: 'outline',
                    })} w-fit p-2 h-full text-black`}
                    onClick={() => setIsEditingShip((p) => !p)}
                  >
                    <Icon glyph="edit" width={24} /> Edit
                  </Button>
                </div>

                <AnimatePresence>
                  {isEditingShip && selectedShip && (
                    <motion.div
                      key="edit-ship-form"
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: 'fit-content',
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                    >
                      <Card className="p-2 mt-2 text-white !bg-white/15">
                        <EditShipForm
                          ship={selectedShip}
                          shipChain={getChainFromAnyId(selectedShip.id)}
                          closeForm={() => setIsEditingShip(false)}
                          setShips={setShips}
                        />
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedShipChain ? (
                  <motion.div className="flex items-center gap-4 mt-4">
                    <ShipPillCluster
                      transparent={true}
                      chain={selectedShipChain}
                    />
                  </motion.div>
                ) : null}

                {selectedShipChain && selectedShipChain!.length > 1 ? (
                  <>
                    <button
                      onClick={() => setUpdateChainExpanded((p) => !p)}
                      className="mt-2 inline-flex items-center"
                    >
                      {updateChainExpanded ? 'Hide' : 'View'}{' '}
                      {selectedShipChain.length - 1} update
                      {selectedShipChain.length - 1 === 1 ? ' ' : 's '}
                      <motion.span
                        animate={{
                          rotate: updateChainExpanded ? '0deg' : '-90deg',
                        }}
                      >
                        <Icon glyph="down-caret" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {updateChainExpanded ? (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: 'fit-content',
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <ol className="border-l-4 border-[#9AD9EE] pl-2 ml-2 rounded-lg space-y-2">
                            {selectedShipChain
                              ? selectedShipChain.map(
                                  (ship: Ship, idx: number) => (
                                    <li key={idx} className="mt-2 ml-2 rounded">
                                      <p className="inline-flex justify-between items-center w-full text-sm p-1">
                                        <div
                                          className="absolute left-2 w-3 h-3 rounded-full bg-[#9AD9EE]"
                                          style={{
                                            translate: 'calc(-50% + 2px)',
                                          }}
                                        ></div>
                                        <span>
                                          {idx === 0
                                            ? 'Start'
                                            : `Update ${idx + 1}`}
                                          <span className="text-xs ml-2 text-indigo-100">
                                            {timeAgo.format(
                                              new Date(ship.createdTime),
                                            )}
                                          </span>
                                        </span>
                                        <span className="inline-flex gap-1">
                                          <ShipPillCluster
                                            transparent={true}
                                            size="small"
                                            chain={[ship]}
                                          />
                                        </span>
                                      </p>
                                      <p className="text-xs p-1 text-indigo-100">
                                        {ship.updateDescription}
                                      </p>
                                    </li>
                                  ),
                                )
                              : null}
                          </ol>

                          {selectedShipChain.at(-1)?.shipStatus !== 'staged' ? (
                            <Button
                              onClick={async (e) => {
                                e.stopPropagation()
                                setNewUpdateShip(selectedShip)
                              }}
                              className={`${buttonVariants({ variant: 'outline' })} block mx-auto mt-4`}
                            >
                              Ship a new update
                            </Button>
                          ) : null}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </>
                ) : null}

                {selectedShip?.shipType === 'update' ? (
                  <>
                    <Image
                      src="/hr.svg"
                      className="w-2/3 mx-auto my-3"
                      alt=""
                      width={461}
                      height={11}
                    />

                    <div>
                      <h3 className="text-xl">Update description</h3>
                      <p>{selectedShip?.updateDescription}</p>
                    </div>
                  </>
                ) : null}

                <Image
                  src="/hr.svg"
                  className="w-2/3 mx-auto my-3"
                  alt=""
                  width={461}
                  height={11}
                />

                {readmeText ? (
                  <div className="prose max-w-none">
                    {readmeText === '?' ? (
                      <div className="p-2 text-center">
                        <p>RAHHHH! You entered a bad README URL.</p>
                        <p className="text-xs">
                          Bestie you gotta click <code>Raw</code> on your README
                          and then copy the URL
                          <br />
                          (it should start with{' '}
                          <code>raw.githubusercontent.com</code> and end in{' '}
                          <code>.md</code>)
                        </p>
                        <Image
                          src={ReadmeHelperImg}
                          alt=""
                          width={400}
                          height={100}
                          className="mx-auto object-cover mt-2"
                        />
                      </div>
                    ) : (
                      <>
                        <ReactMarkdown
                          components={markdownComponents}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {readmeText}
                        </ReactMarkdown>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-center">Loading README...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!errorModal} close={() => setErrorModal(undefined)}>
        <p className="text-3xl mb-4">Arrrr! Something broke.</p>
        <p className="mb-12">{errorModal}</p>
        <img
          src="/dino_debugging_white.svg"
          alt="a confused dinsaur"
          className="mx-auto"
        />
        <Button
          className="block ml-auto"
          onClick={() => setErrorModal(undefined)}
        >
          Whatever
        </Button>
      </Modal>
    </>
  )
}
