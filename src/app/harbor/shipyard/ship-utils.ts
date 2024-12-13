'use server'

import { getSelfPerson } from '@/app/utils/airtable'
import { getSession } from '@/app/utils/auth'
import { fetchShips, person } from '@/app/utils/data'
import { getWakaSessions } from '@/app/utils/waka'
import { cookies } from 'next/headers'
import type { Ship } from '@/app/utils/data'
import Airtable from 'airtable'
import { withLock } from '../../../../lib/redis-lock'
import sum from '../../../../lib/sum'

const peopleTableName = 'people'
const shipsTableName = 'ships'

const base = () => {
  const baseId = process.env.BASE_ID
  if (!baseId) throw new Error('No Base ID env var set')

  return Airtable.base(baseId)
}

const shipToFields = (ship: Ship, entrantId: string) => ({
  // Think of this as `impl Clone`. Only include the fields you want in a cloned Ship.
  title: ship.title,
  entrant: [entrantId],
  repo_url: ship.repoUrl,
  readme_url: ship.readmeUrl,
  deploy_url: ship.deploymentUrl,
  screenshot_url: ship.screenshotUrl,
  ship_type: ship.shipType,
  update_description: ship.updateDescription,
  wakatime_project_name: ship.wakatimeProjectNames.join('$$xXseparatorXx$$'),
})

export async function createShip(formData: FormData, isTutorial: boolean) {
  const session = await getSession()
  if (!session) {
    const error = new Error(
      'Tried to submit a ship with no Slack OAuth session',
    )
    console.log(error)
    throw error
  }

  const slackId = session.slackId
  return await withLock(`ship:${slackId}`, async () => {
    const entrantId = await getSelfPerson(slackId).then((p) => p.id)

    const isShipUpdate = formData.get('isShipUpdate')

    let for_ysws: FormDataEntryValue | null = formData.get('yswsType')
    if (for_ysws == 'none') for_ysws = null

    const newShip = await base()(shipsTableName).create(
      [
        {
          // @ts-expect-error No overload matches this call - but it does
          fields: {
            title: formData.get('title'),
            entrant: [entrantId],
            repo_url: formData.get('repo_url'),
            readme_url: formData.get('readme_url'),
            deploy_url: formData.get('deployment_url'),
            screenshot_url: formData.get('screenshot_url'),
            ship_type: isShipUpdate ? 'update' : 'project',
            update_description: isShipUpdate
              ? formData.get('updateDescription')
              : null,
            wakatime_project_name: formData.get('wakatime_project_name'),
            project_source: isTutorial ? 'tutorial' : 'high_seas',
            for_ysws,
          },
        },
      ],
      (err: Error, records: any) => {
        if (err) console.error(err)
      },
    )

    await cookies().delete('ships')
  })
}

// @malted: I'm confident this is secure.
export async function createShipUpdate(
  dangerousReshippedFromShipId: string,
  credited_hours: number,
  formData: FormData,
): Promise<Ship | null> {
  const session = await getSession()
  if (!session) {
    const error = new Error(
      'Tried to submit a ship with no Slack OAuth session',
    )
    console.error(error)
    throw error
  }

  const slackId = session.slackId

  return withLock(`update:${slackId}`, async () => {
    const entrantId = await getSelfPerson(slackId).then((p) => p.id)

    // This pattern makes sure the ship data is not fraudulent
    const ships = await fetchShips(slackId)

    const reshippedFromShip = ships.find(
      (ship: Ship) => ship.id === dangerousReshippedFromShipId,
    )
    if (!reshippedFromShip) {
      const error = new Error('Invalid reshippedFromShipId!')
      console.error(error)
      throw error
    }

    /* Two things are happening here.
     * Firstly, the new ship of ship_type "update" needs to be created.
     *  - This will have all the same fields as the reshipped ship.
     *  - The update_descripton will be the new entered form field though.
     *  - The reshipped_from field should have the record ID of the reshipped ship
     * Secondly, the reshipped_to field on the reshipped ship should be updated to be the new update ship's record ID.
     */

    // Step 1:
    const res: { id: string; fields: any } = await new Promise(
      (resolve, reject) => {
        base()(shipsTableName).create(
          [
            {
              // @ts-expect-error No overload matches this call - but it does
              fields: {
                ...shipToFields(reshippedFromShip, entrantId),
                ship_type: 'update',
                update_description: formData.get('update_description'),
                reshipped_from: [reshippedFromShip.id],
                reshipped_from_all: reshippedFromShip.reshippedFromAll
                  ? [
                      ...reshippedFromShip.reshippedFromAll,
                      reshippedFromShip.id,
                    ]
                  : [reshippedFromShip.id],
                credited_hours,
                for_ysws: reshippedFromShip.yswsType,
              },
            },
          ],
          async (err: Error, records: any) => {
            if (err) {
              console.error('createShipUpdate step 1:', err)
              throw err
            }
            if (records) {
              // Step 2
              if (records.length !== 1) {
                const error = new Error(
                  'createShipUpdate: step 1 created records result length is not 1',
                )
                console.error(error)
                reject(error)
              }
              const reshippedToShip = records[0]

              // Update previous ship to point reshipped_to to the newly created update record
              await base()(shipsTableName).update([
                {
                  id: reshippedFromShip.id,
                  fields: {
                    reshipped_to: [reshippedToShip.id],
                    reshipped_all: reshippedFromShip.reshippedFromAll
                      ? [
                          ...reshippedFromShip.reshippedFromAll,
                          reshippedFromShip.id,
                        ]
                      : [reshippedFromShip.id],
                  },
                },
              ])

              resolve(reshippedToShip)
            } else {
              console.error('AAAFAUKCSCSAEVTNOESIFNVFEINTTET🤬🤬🤬')
              reject(new Error('createShipUpdate: step 1 created no records'))
            }
          },
        )
      },
    )

    let for_ysws: FormDataEntryValue | null = formData.get('yswsType')
    if (for_ysws == 'none') for_ysws = null

    await cookies().delete('ships')

    return {
      ...reshippedFromShip,
      id: res.id,
      repoUrl: reshippedFromShip.repoUrl,
      readmeUrl: reshippedFromShip.readmeUrl,
      screenshotUrl: reshippedFromShip.screenshotUrl,
      deploymentUrl: reshippedFromShip.deploymentUrl,
      shipType: 'update',
      shipStatus: 'staged',
      updateDescription: formData.get('update_description')?.toString() || null,
      reshippedFromId: reshippedFromShip.id,
      reshippedFromAll: reshippedFromShip.reshippedFromAll
        ? [...reshippedFromShip.reshippedFromAll, reshippedFromShip.id]
        : [reshippedFromShip.id],
      credited_hours,
      total_hours: (reshippedFromShip.total_hours ?? 0) + credited_hours,
      wakatimeProjectNames: reshippedFromShip.wakatimeProjectNames,
      for_ysws,
    }
  })
}

export async function updateShip(ship: Ship) {
  const session = await getSession()
  if (!session) {
    const error = new Error('Tried to stage a ship with no Slack OAuth session')
    console.log(error)
    throw error
  }

  console.log('updating!', ship)
  console.log(ship.yswsType)

  await new Promise((resolve, reject) => {
    base()(shipsTableName).update(
      [
        {
          id: ship.id,
          fields: {
            title: ship.title,
            repo_url: ship.repoUrl,
            readme_url: ship.readmeUrl,
            deploy_url: ship.deploymentUrl,
            screenshot_url: ship.screenshotUrl,
            ...(ship.updateDescription && {
              update_description: ship.updateDescription,
            }),
            for_ysws: ship.yswsType,
          },
        },
      ],
      (err: Error, records: any) => {
        if (err) {
          reject(err)
        }
        resolve(records)
      },
    )
  })
  await cookies().delete('ships')
}

// Good function. I like. Wawaweewah very nice.
export async function stagedToShipped(
  ship: Ship,
  ships: Ship[],
): Promise<{ error?: string; ok: boolean }> {
  const session = await getSession()
  if (!session) {
    const error = "You tried to ship a draft Ship, but you're not signed in!"
    return { error, ok: false }
  }

  const p = await person()

  if (!p.fields.academy_completed) {
    const error =
      "You can't ship a Ship if you haven't completed Pirate Academy!"
    return { error, ok: false }
  }
  if (!p.fields.verified_eligible) {
    const error = "You can't ship a Ship before you've been verified!"
    return { error, ok: false }
  }
  if (!ship.wakatimeProjectNames) {
    const error =
      "You can't ship a Ship that has no Hackatime projects associated with it!"
    return { error, ok: false }
  }

  const previousShip = ships.find((s) => s.id === ship.reshippedFromId)

  const wakatimeProjects = await getWakaSessions()
  console.log('woah. we got waktime projects', wakatimeProjects)
  const associatedProjects = wakatimeProjects.projects.filter(({ key }) =>
    ship.wakatimeProjectNames.includes(key),
  )
  const projectHours = associatedProjects.map(({ total }) => total / 60 / 60)
  const totalHours = sum(projectHours) - (previousShip?.total_hours ?? 0)

  if (totalHours < 1) {
    const error =
      'Projects must be at least one hour. Spend a little more time on this one!'
    return { error, ok: false }
  }

  const fields = {
    ship_status: 'shipped',
    credited_hours: totalHours,
  }

  await new Promise((resolve, reject) => {
    base()(shipsTableName).update(
      [
        {
          id: ship.id,
          fields,
        },
      ],
      (err: Error, records: any) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(records)
      },
    )
  })
  await cookies().delete('ships')
  return { ok: true }
}

export async function deleteShip(shipId: string) {
  const session = await getSession()
  if (!session) {
    const error = new Error(
      'Tried to delete a ship with no Slack OAuth session',
    )
    console.log(error)
    throw error
  }

  await new Promise((resolve, reject) => {
    base()(shipsTableName).update(
      [
        {
          id: shipId,
          fields: {
            ship_status: 'deleted',
          },
        },
      ],
      (err: Error, records: any) => {
        if (err) {
          reject(err)
        }
        resolve(records)
      },
    )
  })
  await cookies().delete('ships')
}
