import { getBestShips, Ship } from '@/app/utils/data'
import JaggedCard from '@/components/jagged-card'
import Pill from '@/components/ui/pill'
import { useEffect, useState } from 'react'
import DoubloonsImage from '/public/doubloon.svg'
import Image from 'next/image'

export default function BestShips() {
  const [bestShips, setBestShips] = useState<Ship[]>()

  useEffect(() => {
    getBestShips().then(setBestShips)
  }, [])

  return (
    <div>
      <h2 className="mt-8 font-heading text-2xl font-bold mb-4 text-center">
        Best ships this week
      </h2>

      {bestShips ? (
        <div className="flex gap-4 overflow-x-scroll">
          {bestShips.map((partialShip: any, idx: number) => {
            return (
              <JaggedCard
                shadow={false}
                className="w-96 h-full flex flex-col gap-2 justify-between items-center"
                key={idx}
              >
                <p className="text-lg">{partialShip.title}</p>
                <Pill
                  msg={`${partialShip.payout} doubloons`}
                  classes="bg-white/15 text-white"
                  glyphImage={
                    <Image src={DoubloonsImage} alt="Doubloons" height={20} />
                  }
                />
                <div className="flex gap-3">
                  <a target="_blank" href={partialShip.repoUrl}>
                    <Pill
                      classes="bg-white/15 text-white"
                      glyph="github"
                      msg="Repository"
                      color="gray"
                    />
                  </a>
                  <a target="_blank" href={partialShip.deployUrl}>
                    <Pill
                      classes="bg-white/15 text-white"
                      glyph="view-forward"
                      msg="Play"
                      color="gray"
                    />
                  </a>
                </div>
                <div className="h-40 mx-auto rounded">
                  <a href={partialShip.screenshotUrl}>
                    <img
                      src={partialShip.screenshotUrl}
                      alt=""
                      className="h-full object-contain rounded"
                    />
                  </a>
                </div>
              </JaggedCard>
            )
          })}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
