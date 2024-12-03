import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
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
import { getSession } from '@/app/utils/auth'
import Link from 'next/link'

import ShipPillCluster from '@/components/ui/ship-pill-cluster'
import NoImgDino from '/public/no-img-dino.png'
import NoImgBanner from '/public/no-img-banner.png'
import ReadmeHelperImg from '/public/readme-helper.png'
import NewUpdateForm from './new-update-form'
import Modal from '../../../components/ui/modal'
import RepoLink from '@/components/ui/repo_link'

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

  const [readmeText, setReadmeText] = useState<string | null>(null)
  const [newShipVisible, setNewShipVisible] = useState(false)
  const [newUpdateShip, setNewUpdateShip] = useState<Ship | null>(null)
  const [session, setSession] = useState<HsSession | null>(null)
  const [isEditingShip, setIsEditingShip] = useState(false)
  const [errorModal, setErrorModal] = useState<string>()
  const [shipReqModal, setShipReqModal] = useState<boolean>(false)
  const canvasRef = useRef(null)

  const [isShipping, setIsShipping] = useState(false)

  const [shipChains, setShipChains] = useState<Map<string, string[]>>()

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

  const [shippedShips, setShippedShips] = useState<Ship[]>([])

  useEffect(() => {
    const localShippedShips = ships.filter(
      (ship: Ship) =>
        ship.shipStatus === 'shipped' && ship.shipType === 'project',
    )

    const localUpdateShips = ships.filter(
      (ship: Ship) =>
        ship.shipStatus === 'shipped' && ship.shipType === 'update',
    )

    // Consolidate projects and updates in a Map to handle "reshipping" logic efficiently
    const shippedShipsMap = new Map(
      localShippedShips.map((ship) => [ship.id, { ...ship }]),
    )

    for (const update of localUpdateShips) {
      const reshippedFromId = update.reshippedFromId
      const updateCopy = { ...update }

      if (reshippedFromId && shippedShipsMap.has(reshippedFromId)) {
        const originalShip = shippedShipsMap.get(reshippedFromId)
        shippedShipsMap.set(reshippedFromId, {
          ...updateCopy,
          doubloonPayout:
            updateCopy.doubloonPayout + (originalShip?.doubloonPayout || 0),
        })
      } else {
        shippedShipsMap.set(updateCopy.id, updateCopy)
      }
    }

    const sortedShips = Array.from(shippedShipsMap.values()).sort(
      (a, b) => new Date(b?.createdTime) - new Date(a?.createdTime),
    ) as Ship[]
    setShippedShips(sortedShips)
  }, [ships])

  // Populate shipChains with data from shippedShips in useEffect to avoid updating on every render
  useEffect(() => {
    const newShipChains = new Map<string, string[]>()
    for (const ship of shippedShips) {
      const wakatimeProjectName = ship.wakatimeProjectNames.join(',')
      if (ship.reshippedAll) {
        newShipChains.set(wakatimeProjectName, ship.reshippedAll)
      }
    }
    setShipChains(newShipChains)
  }, [shippedShips])

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
            <ShipPillCluster ship={s} shipChains={shipChains} />
          </div>
        </div>

        {bareShips ? null : (
          <div className="mt-4 sm:mt-0 sm:ml-auto">
            {s.shipStatus === 'staged' ? (
              <Button
                id="ship-ship"
                onClick={async (e) => {
                  e.stopPropagation()
                  console.log('Shipping', s)

                  try {
                    setIsShipping(true)
                    const shippingResult: boolean = await stagedToShipped(
                      s,
                      ships,
                    )
                    if (!shippingResult) {
                      setShipReqModal(true)
                    } else {
                      location.reload()
                    }
                  } catch (err: unknown) {
                    if (err instanceof Error) {
                      setErrorModal(err.message)
                    } else {
                      setErrorModal(String(err))
                    }
                  } finally {
                    setIsShipping(false)
                  }
                }}
                disabled={isShipping}
              >
                {isShipping ? 'Shipping...' : 'SHIP SHIP!'}
              </Button>
            ) : s.paidOut ? (
              !stagedShips.find(
                (stagedShip) =>
                  stagedShip.wakatimeProjectNames.join(',') ===
                  s.wakatimeProjectNames.join(','),
              ) ? (
                <Button
                  onClick={async (e) => {
                    e.stopPropagation()
                    alert(
                      'Blimeys!! Sorry, but updates are broken right now – the dev team is working on a fix',
                    )
                    //console.log('Shipping an update...', s)
                    //setNewUpdateShip(s)
                  }}
                >
                  Ship an update!
                </Button>
              ) : (
                <p>Ship your Update!</p>
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
            <h2 className="text-center text-2xl mb-2 text-blue-500">
              Draft Ships
            </h2>
          )}

          <div id="staged-ships-container" className="space-y-4">
            {stagedShips.map((ship: Ship, idx: number) => (
              <SingleShip
                s={ship}
                key={ship.id}
                id={`staged-ship-${idx}`}
                setNewShipVisible={setNewShipVisible}
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full relative">
        {shippedShips.length > 0 ? (
          <div className={`space-y-4 ${bareShips ? '' : 'mt-8'}`}>
            {bareShips ? null : (
              <h2 className="text-center text-2xl text-blue-500">
                Shipped Ships
              </h2>
            )}

            {shippedShips.map((ship: Ship, idx: number) => (
              <SingleShip
                s={ship}
                key={ship.id}
                id={`shipped-ship-${idx}`}
                setNewShipVisible={setNewShipVisible}
              />
            ))}
          </div>
        ) : null}

        {shippedShips.length < 1 && stagedShips.length < 1 ? (
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
        isOpen={newUpdateShip && session}
        close={() => setNewUpdateShip(null)}
      >
        <NewUpdateForm
          shipToUpdate={newUpdateShip}
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
        <Card
          className="relative w-full max-w-2xl"
          style={{
            maxHeight: '75vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-48 z-10">
            <Image
              src={selectedShip?.screenshotUrl}
              alt={`Screenshot of ${selectedShip?.title}`}
              className="object-cover max-w-full"
              fill={true}
              priority
              unoptimized
              sizes="4rem"
              onError={({ target }) => {
                target.src = NoImgBanner.src
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          </div>

          <div className=" flex-grow pt-48" id="selected-ship-card">
            <CardHeader className="relative">
              <h2 className="text-3xl font-bold">{selectedShip?.title}</h2>
              <p className="opacity-50">
                {selectedShip?.wakatimeProjectNames ? (
                  `Wakatime project name: ${selectedShip?.wakatimeProjectNames}`
                ) : (
                  <div className="flex items-center gap-1">
                    <Icon glyph="important" />
                    No Wakatime project name!
                  </div>
                )}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
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
                      className="w-full h-full"
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
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <Card className="p-2 mt-2 bg-neutral-100">
                        <EditShipForm
                          ship={selectedShip}
                          closeForm={() => setIsEditingShip(false)}
                          setShips={setShips}
                        />
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div className="flex items-center gap-4 mt-4">
                  <ShipPillCluster
                    ship={selectedShip}
                    shipChains={shipChains}
                  />
                </motion.div>

                {selectedShip?.shipType === 'update' ? (
                  <>
                    <hr className="my-5" />
                    <div>
                      <h3 className="text-xl">Update description</h3>
                      <p>{selectedShip?.updateDescription}</p>
                    </div>
                  </>
                ) : null}

                <hr className="my-5" />

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
                        <h3 className="text-xl">Main Project README</h3>
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
            </CardContent>
          </div>
        </Card>
      </Modal>

      <Modal isOpen={shipReqModal} close={() => setShipReqModal(false)}>
        <p className="text-3xl mb-4">Avast, Sailor!</p>
        <p className="text-xl mb-4">
          Projects must be at least one hour. Spend a little more time on this
          one!
        </p>
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
