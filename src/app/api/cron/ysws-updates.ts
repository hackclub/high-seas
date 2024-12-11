import { withLock } from '../../../../lib/redis-lock'
import Airtable from 'airtable'

function and(...args: string[]) {
  if (args.length === 0) return 'TRUE()'
  if (args.length === 1) return args[0]
  return `AND(${args.join(',')})`
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
}).base('appTeNFYcUiYfGcR6')

const yswsBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
}).base('app3A5kJwYqxMLOgh')

async function createNewShipChains(): Promise<void> {
  await withLock('create-ship-chains', async () => {
    console.log('finding ysws to update')
    const shipchainsToMake = await base('ships')
      .select({
        filterByFormula: and(
          'ship_chain = BLANK()',
          'reshipped_from = BLANK()',
        ),
        maxRecords: 10,
      })
      .all()

    if (shipchainsToMake.length === 0) {
      console.log('no new chains to create')
      return
    }

    console.log('creating new ship chains!')
    await base('ship_chains').create(
      shipchainsToMake.map((ship) => ({
        fields: {
          ships: [ship.id],
        },
      })),
    )
  })
}

async function addToShipChains(): Promise<void> {
  await withLock('add-to-ship-chains', async () => {
    const shipsMissingChains = await base('ships')
      .select({
        filterByFormula: and(
          'ship_chain = BLANK()',
          'reshipped_from != BLANK()',
          'reshipped_to = BLANK()',
        ),
        maxRecords: 3,
      })
      .all()

    if (shipsMissingChains.length === 0) {
      console.log('no ships missing their chain')
      return
    }

    console.log('adding to ship chains!')

    let alreadyProcessed = [] as string[]
    for (let i = 0; i < shipsMissingChains.length; i++) {
      const leafShip = shipsMissingChains[i]
      if (alreadyProcessed.includes(leafShip.id)) {
        console.log('already processed', leafShip.id)
        continue
      }
      const parentShipId = leafShip?.fields?.reshipped_from?.[0]
      const { chainID, shipsToUpdate } = await traceChain(parentShipId)
      if (chainID) {
        const shipsInChain = [...shipsToUpdate, leafShip.id]
        console.log(
          'Updating these ships',
          shipsInChain,
          'to use chain',
          chainID,
        )
        const shipChainRecord = await base('ship_chains').find(chainID)
        const oldLinkedShips = (shipChainRecord?.fields?.ships ||
          []) as string[]
        const mergedShips = uniq(shipsInChain.concat(oldLinkedShips))

        alreadyProcessed = alreadyProcessed.concat(shipsInChain)

        await base('ship_chains').update([
          {
            id: chainID,
            fields: {
              ships: mergedShips,
            },
          },
        ])
      } else {
        console.log('no chain found')
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  })
}

// given a record ID, trace the chain of reshipped_from records until we find one with a chain
// also return a list of the traversed ships so we can update them all at once and save requests
async function traceChain(
  recordID: string,
): Promise<{ chainID: string | null; shipsToUpdate: string[] }> {
  console.log('tracing chain', recordID)
  const cursorRec = await base('ships').find(recordID)
  const cursorChainID = cursorRec?.fields?.ship_chain?.[0]
  if (cursorChainID) {
    return { chainID: cursorChainID, shipsToUpdate: [recordID] }
  } else {
    const parentShipID = cursorRec?.fields?.reshipped_from?.[0]
    if (!parentShipID) {
      return { chainID: null, shipsToUpdate: [recordID] }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const { chainID, shipsToUpdate } = await traceChain(parentShipID)
    if (chainID) {
      return { chainID, shipsToUpdate: [recordID, ...shipsToUpdate] }
    }
  }
  return { chainID: null, shipsToUpdate: [recordID] }
}

async function updateHours(): Promise<void> {
  await withLock('update-hours', async () => {
    const yswsSubmissions = await base('ysws_submission')
      .select({
        filterByFormula: and(
          "ship__project_source = 'high_seas'",
          'ysws_db_record_id != BLANK()',
          "OR(last_sync_time = BLANK(), DATETIME_DIFF(TODAY(), last_sync_time, 'days') > 1)",
        ),
        maxRecords: 3,
      })
      .all()

    for (let i = 0; i < yswsSubmissions.length; i++) {
      const submission = yswsSubmissions[i]
      const yswsRecordID = submission?.fields?.ysws_db_record_id
      const submissionHours =
        submission?.fields?.['ship__chain__credited_hours']?.[0]
      const submissionTime = submission?.fields?.['ship__created_time']?.[0]
      if (!yswsRecordID || !submissionHours || !submissionTime) {
        continue
      }
      new Promise((resolve) => setTimeout(resolve, 1000))
      const yswsRecord = await yswsBase('Grants Awarded').find(yswsRecordID)
      if (!yswsRecord) {
        continue
      }
      const hours = yswsRecord.fields['Override Hours Spent']
      const fieldsToUpdate = {
        'Approved At': new Date(submissionTime).toDateString(),
      }
      if (hours == submissionHours) {
        console.log('hours match', yswsRecordID, hours.toFixed(1))
      } else {
        const diff = hours - submissionHours
        const sign = diff > 0 ? '+' : '-'
        const formattedDiff = Math.abs(diff).toFixed(1)
        console.log(
          'updating hours',
          yswsRecordID,
          submissionHours.toFixed(1),
          `${sign}${formattedDiff}`,
        )
        fieldsToUpdate['Override Hours Spent'] = submissionHours
      }
      await yswsRecord.updateFields(fieldsToUpdate)
      new Promise((resolve) => setTimeout(resolve, 1000))

      await submission.updateFields({ last_sync_time: new Date() })
      new Promise((resolve) => setTimeout(resolve, 1000))
    }
  })
}

export default async function yswsUpdates() {
  // find any root projects without chains
  await createNewShipChains()

  new Promise((resolve) => setTimeout(resolve, 1000))
  // find any leaf projects missing a chain
  await addToShipChains()

  new Promise((resolve) => setTimeout(resolve, 1000))
  // hours might change after we update the shipping chain
  await updateHours()
}
