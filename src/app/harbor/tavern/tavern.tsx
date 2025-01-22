'use client'

import { useEffect, useState } from 'react'
import useLocalStorageState from '../../../../lib/useLocalStorageState'
import {
  setTavernRsvpStatus,
  getTavernRsvpStatus,
  submitMyTavernLocation,
  getMyTavernLocation,
  submitShirtSize,
  getShirtSize,
} from '@/app/utils/tavern'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import {
  getTavernEvents,
  getTavernPeople,
  TavernEventItem,
  TavernPersonItem,
} from './tavern-utils'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

const Map = dynamic(() => import('./map'), {
  ssr: false,
})

const RsvpStatusSwitcher = ({ tavernEvents, onTavernSelect }) => {
  const [rsvpStatus, setRsvpStatus] = useLocalStorageState(
    'cache.rsvpStatus',
    'none',
  )
  const [whichTavern, setWhichTavern] = useLocalStorageState(
    'cache.whichTavern',
    'none',
  )
  const [shirtSize, setShirtSize] = useLocalStorageState(
    'cache.shirtSize',
    'none',
  )
  const [attendeeNoOrganizerModal, setAttendeeNoOrganizerModal] =
    useState(false)

  useEffect(() => {
    // set rsvp status
    getTavernRsvpStatus().then((status) => setRsvpStatus(status))
    getShirtSize().then((ss) => setShirtSize(ss))
  }, [])

  const onOptionChangeHandler = (e) => {
    const status = e.target.value
    setRsvpStatus(status)
    setTavernRsvpStatus(status)

    if (status !== 'participant' && status !== 'organizer') {
      setWhichTavern('none')
      submitMyTavernLocation(null)
      onTavernSelect(null)
    }
  }

  const onTavernChangeHandler = (event) => {
    const tavernId = event.target.value
    setWhichTavern(tavernId)
    submitMyTavernLocation(tavernId).catch(console.error)
    onTavernSelect(tavernId)

    if (
      rsvpStatus === 'participant' &&
      tavernEvents.find((te) => te.id === tavernId).organizers.length === 0
    ) {
      console.log('u shoiuld vhe an organizer')
      setAttendeeNoOrganizerModal(true)
    }
  }

  return (
    <>
      <Modal
        isOpen={attendeeNoOrganizerModal}
        close={() => setAttendeeNoOrganizerModal(false)}
      >
        ARRRRR! There are enough pirates here to host a tavern, but nobody has
        volunteered to organize.
        <br />
        <br />
        It's easy, all you would need to do is select a venue, date, distribute
        shirts, and help peolpe coordianate how they're going to attend.
        <br />
        <br />
        Please consider volunteering to organize this tavern, me hearty!
      </Modal>
      <div className="text-center mb-6 mt-12" id="region-select">
        <label>Will you join?</label>
        <select
          onChange={onOptionChangeHandler}
          value={rsvpStatus}
          className="ml-2 text-gray-600 rounded-sm"
        >
          <option disabled>Select</option>
          <option value="none">Nope, can't do either</option>
          <option value="organizer">I can organize a tavern near me</option>
          <option value="participant">I want to attend a tavern near me</option>
        </select>

        {tavernEvents &&
        (rsvpStatus === 'participant' || rsvpStatus === 'organizer') ? (
          <div>
            <label>Which tavern will you attend?</label>
            <select
              onChange={onTavernChangeHandler}
              value={whichTavern}
              className="ml-2 text-gray-600 rounded-sm"
            >
              <option value="" disabled>
                Select
              </option>
              {tavernEvents.map((te, idx) => (
                <option key={idx} value={te.id}>
                  {te.locality}
                  {te.organizers.length === 0 ? ' (no organizers yet!)' : ''}
                </option>
              ))}
            </select>

            <label>What is your shirt size?</label>
            <select
              onChange={async (e) => {
                setShirtSize(e.target.value)
                await submitShirtSize(e.target.value)
              }}
              value={shirtSize}
              className="ml-2 text-gray-600 rounded-sm"
            >
              <option disabled>Select</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default function Tavern() {
  const [tavernPeople, setTavernPeople] = useState<TavernPersonItem[]>([])
  const [tavernEvents, setTavernEvents] = useState<TavernEventItem[]>([])
  const [selectedTavern, setSelectedTavern] = useState<TavernEventItem | null>(
    null,
  )

  useEffect(() => {
    Promise.all([
      getTavernPeople(),
      getTavernEvents(),
      getMyTavernLocation(),
    ]).then(([tp, te, myTavernLocation]) => {
      setTavernPeople(tp)
      setTavernEvents(te)
      setSelectedTavern(myTavernLocation)
    })
  }, [])

  const handleTavernSelect = (tavernId: string | null) => {
    const tavern = tavernEvents.find((te) => te.id === tavernId) || null
    setSelectedTavern(tavern)
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white relative">
      <div className="text-white">
        <h1 className="font-heading text-5xl mb-6 text-center relative w-fit mx-auto">
          Mystic Tavern
        </h1>
        <Card className="my-8 p-6">
          <p className="mb-4">
            On January 31st, thousands of ships will sail back to port,
            weathered and weary from their months-long voyage upon the High
            Seas. And yet, their journey—your journey—ends not at the dock… but
            in the firelit alcoves of the ✨Mystic Tavern✨.
          </p>
          <p className="mb-4">
            Join your fellow sailors to share tales and make merry over flagons
            of milk, to boast of your booty and exclaim the exploits of your
            greatest ships! Oh, and since most pirates don’t own cars, Hack
            Club’s{' '}
            <a href="#" target="_blank">
              gas fund
            </a>{' '}
            will cover your transportation.
          </p>
          <p className="mb-4">
            The tavern is not a single location, but a manifestation of pirate
            camaraderie known to appear wherever an intrepid sailor focuses
            their spirit.{' '}
            <strong>
              We need captains in every city to step up and make their local
              Mystic Tavern their final and most selfless ship.
            </strong>
          </p>
          <p className="mb-4">
            Should you wish to organize such a gathering of shipmates, here are
            some things that will be asked of you:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Pick a date during the third week of February</li>
            <li>
              Find a local venue (coffee shop, restaurant, library, park,
              whatever)
            </li>
            <li>Manage signups and communications for pirates in your area</li>
            <li>Receive and distribute special shirts at the event</li>
            <li>Make it memorable for people!</li>
          </ul>
          <p className="mb-4">
            So RSVP today to meet your local hearties at a tavern near you.
            Better yet, volunteer to make one happen! Because like, Hack Club is
            made of real people. You should meet each other, you’re pretty cool
            😉
          </p>
        </Card>
        <RsvpStatusSwitcher
          tavernEvents={tavernEvents}
          onTavernSelect={handleTavernSelect}
        />

        <Map
          tavernEvents={tavernEvents}
          tavernPeople={tavernPeople}
          selectedTavern={selectedTavern}
        />
      </div>
    </div>
  )
}
