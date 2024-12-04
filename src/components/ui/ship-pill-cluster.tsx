import type { Ship } from '@/app/utils/data'
import Pill from './pill'

import DoubloonsImage from '/public/doubloon.svg'
import Image from 'next/image'
import pluralize from '../../../lib/pluralize'

export default function ShipPillCluster({
  chain,
  transparent = false,
  size = 'default',
}: {
  chain: Ship[]
  transparent?: boolean
  size?: 'small' | 'default'
}) {
  if (!chain) return null

  const shipUpdateCount = chain.length - 1
  const roundedPayout = Math.round(
    chain.reduce((acc, curr) => (acc += curr.doubloonPayout), 0),
  )
  const roundedHr = chain
    .reduce((acc, curr) => {
      if (!curr.reshippedToId && curr.shipStatus === 'staged') return acc

      return (acc += curr.credited_hours ?? 0)
    }, 0)
    .toFixed(1)
  console.log('byeeee')

  const allShipsHaveVoteRequirementMet = !chain.some(
    (s) => !s.voteRequirementMet,
  )

  return (
    <>
      {/* {JSON.stringify(chain[0].reshippedFromId)},,
      {JSON.stringify(chain[0].shipStatus)} */}
      {
        /*!chain[0].reshippedFromId && */ chain[0].shipStatus === 'staged' ? (
          <Pill
            classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
            msg="Pending"
            glyphSize={size === 'small' ? 16 : 20}
            glyph="clock"
          />
        ) : (
          <Pill
            classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
            msg={pluralize(roundedHr, 'hr', true)}
            glyphSize={size === 'small' ? 16 : 20}
            glyph="clock"
          />
        )
      }
      {chain[0].shipStatus === 'shipped' ? (
        <>
          {allShipsHaveVoteRequirementMet ? (
            chain.at(-1)?.doubloonPayout != null ? (
              <Pill
                classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
                msg={pluralize(roundedPayout, 'doubloon', true)}
                glyphSize={size === 'small' ? 16 : 20}
                glyphImage={
                  <Image src={DoubloonsImage} alt="doubloons" height={20} />
                }
              />
            ) : (
              <Pill
                classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
                msg={`Awaiting ${10 - chain.at(-1)?.matchups_count} more ${pluralize(
                  10 - chain.at(-1)?.matchups_count,
                  'vote',
                  false,
                )} from other pirates…`}
                color="blue"
                glyph="event-add"
                glyphSize={size === 'small' ? 16 : 20}
                // percentage={Math.max(chain.at(-1)?.matchups_count * 10, 5)}
              />
            )
          ) : (
            <Pill
              classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
              msg={'Pending: Vote to unlock payout!'}
              color="blue"
              glyph="enter"
              glyphSize={size === 'small' ? 20 : 24}
            />
          )}
        </>
      ) : (
        <Pill
          classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
          msg={`Draft ${chain.at(-1)?.shipType === 'project' ? 'ship' : 'update'}`}
          glyph="attachment"
          glyphSize={size === 'small' ? 16 : 20}
        />
      )}
      {shipUpdateCount > 0 ? (
        <Pill
          classes={`${transparent && 'bg-white/15 text-white'} ${size === 'small' ? 'text-xs' : ''}`}
          msg={pluralize(shipUpdateCount, 'update', true)}
          color="purple"
          glyph="reply"
          glyphSize={size === 'small' ? 20 : 24}
          glyphStyles={{ transform: 'scaleX(-1)' }}
        />
      ) : null}
    </>
  )
}
