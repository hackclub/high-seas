import type { Ship } from '@/app/utils/data'
import Pill from './pill'

import DoubloonsImage from '/public/doubloon.svg'
import Image from 'next/image'
import pluralize from '../../../lib/pluralize'

export default function ShipPillCluster({
  ship,
  shipChains,
}: {
  ship: Ship
  shipChains: Map<string, string[]>
}) {
  const shipUpdates = shipChains
    ? shipChains.get(ship.wakatimeProjectNames.join(','))
    : null
  const shipUpdateCount = shipUpdates ? shipUpdates.length - 1 : null
  const roundedPayout = Math.floor(ship.doubloonPayout)
  const roundedHr = ship.total_hours?.toFixed(1)
  return (
    <>
      {ship.shipStatus === 'shipped' ? (
        <Pill msg={pluralize(roundedHr, 'hr', true)} glyph="clock" />
      ) : (
        <Pill msg="pending ship" glyph="clock" />
      )}

      {ship.shipStatus === 'shipped' &&
        (ship.voteRequirementMet ? (
          ship.doubloonPayout != null ? (
            <Pill
              msg={pluralize(roundedPayout, 'doubloon', true)}
              color="green"
              glyphImage={
                <Image src={DoubloonsImage} alt="doubloons" height={20} />
              }
            />
          ) : (
            <Pill
              msg={`Awaiting ${10 - ship.matchups_count} more ${pluralize(
                10 - ship.matchups_count,
                'vote',
                false,
              )} from other pirates…`}
              color="blue"
              glyph="event-add"
              percentage={Math.max(ship.matchups_count * 10, 5)}
            />
          )
        ) : (
          <Pill
            msg={'Pending: Vote to unlock payout!'}
            color="blue"
            glyph="enter"
          />
        ))}

      {shipUpdateCount && shipUpdateCount > 0 ? (
        <Pill
          msg={pluralize(shipUpdateCount, 'update', true)}
          color="purple"
          glyph="reply"
          glyphStyles={{ transform: 'scaleX(-1)' }}
        />
      ) : null}
    </>
  )
}
