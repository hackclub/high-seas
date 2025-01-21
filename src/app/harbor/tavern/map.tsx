'use client'

import { useEffect, useState } from 'react'
import {
  getTavernPeople,
  getTavernEvents,
  type TavernPersonItem,
  type TavernEventItem,
} from './tavern-utils'
import { type LatLngExpression, DivIcon, Icon } from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Card } from '@/components/ui/card'

const MAP_ZOOM = 2,
  MAP_CENTRE: LatLngExpression = [0, 0]

export default function Map({ tavernEvents, tavernPeople }) {
  return (
    <div>
      <MapContainer
        className="h-96 rounded-lg"
        center={MAP_CENTRE}
        zoom={MAP_ZOOM}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        <TavernMarkers people={tavernPeople} events={tavernEvents} />
        <UserLocation />
      </MapContainer>
      <Card className="mt-8 p-3 flex flex-row justify-center items-center gap-5 flex-wrap">
        <p className="w-full text-center">Map Legend</p>
        <div className="flex flex-row justify-start items-center gap-2">
          <img
            src="/tavern.png"
            alt="a star representing a tavern"
            width={20}
            className="inline-block ml-4 hidden sm:inline"
          />
          <p>Mystic Tavern</p>
        </div>
        <div className="flex flex-row justify-start items-center gap-2">
          <img
            src="/handraise.png"
            alt="someone raising a hand"
            width={20}
            className="inline-block ml-4 hidden sm:inline"
          />
          <p>Mystic Tavern without organizer</p>
        </div>
        <div className="flex flex-row justify-start items-center gap-2">
          <div className="h-7 w-7 rounded-full border-2 border-white bg-[#cfdfff]"></div>
          <p>Someone unable to organize or attend</p>
        </div>
        <div className="flex flex-row justify-start items-center gap-2">
          <div className="h-7 w-7 rounded-full border-2 border-white bg-[#ffd66e]"></div>
          <p>Someone able to organize</p>
        </div>
        <div className="flex flex-row justify-start items-center gap-2">
          <div className="h-7 w-7 rounded-full border-2 border-white bg-[#f82b60]"></div>
          <p>Someone able to attend</p>
        </div>
        <div className="flex flex-row justify-start items-center gap-2">
          <div className="h-7 w-7 rounded-full border-2 border-white bg-[#666666]"></div>
          <p>Someone who has not responded</p>
        </div>
      </Card>
    </div>
  )
}

function UserLocation() {
  const map = useMap()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((loc) => {
        if (map !== null) {
          map.setView([loc.coords.latitude, loc.coords.longitude], 11)
        }
      })
    }
  }, [map])

  return null
}

function TavernMarkers(props: MapProps) {
  const map = useMap()

  if (!map) return null

  const peopleMarkers = props.people.map((t) => {
    let iconClass = `rounded-full border-2 border-white w-full h-full `

    switch (t.status) {
      case 'none': {
        iconClass += 'bg-[#cfdfff]'
        break
      }
      case 'organizer': {
        iconClass += 'bg-[#ffd66e]'
        break
      }
      case 'participant': {
        iconClass += 'bg-[#f82b60]'
        break
      }
      default: {
        iconClass += 'bg-[#666666]'
        break
      }
    }

    const icon = new DivIcon({
      className: iconClass,
      iconSize: [25, 25],
    })

    return (
      <Marker
        key={t.coordinates}
        position={
          t.coordinates.split(', ').map((c) => Number(c)) as LatLngExpression
        }
        icon={icon}
      />
    )
  })
  const eventMarkers = props.events
    .map((e) => {
      if (!e.geocode) {
        return null
      }

      const geocodeObj = JSON.parse(atob(e.geocode.slice(2).trim()))

      if (geocodeObj.o.status !== 'OK') {
        return null
      }

      let iconUrl
      if (e.organizers.length === 0) {
        iconUrl = '/handraise.png'
      } else {
        iconUrl = '/tavern.png'
      }

      const icon = new Icon({
        iconUrl,
        iconSize: [50, 50],
      })

      return (
        <Marker
          key={e.city}
          position={[geocodeObj.o.lat, geocodeObj.o.lng]}
          icon={icon}
          zIndexOffset={20}
        >
          <Tooltip>{e.city}</Tooltip>
        </Marker>
      )
    })
    .filter((e) => e !== null)

  return [...peopleMarkers, ...eventMarkers]
}

type MapProps = {
  people: TavernPersonItem[]
  events: TavernEventItem[]
}
