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
          "OR(last_sync_time = BLANK(), DATETIME_DIFF(TODAY(), last_sync_time, 'days') > 1)",
          // the following 2 lines should be redundant, but in implementation airtable is sending different results without both lines.
          // contrary to the documentation https://support.airtable.com/docs/identifying-blank-values
          'ysws_db_record_id != BLANK()',
          "ysws_db_record_id != ''",
        ),
        maxRecords: 3,
      })
      .all()

    if (yswsSubmissions.length === 0) {
      console.log('no submissions to update')
      return
    }
    console.log('Updating hours for ysws submissions')

    for (let i = 0; i < yswsSubmissions.length; i++) {
      const submission = yswsSubmissions[i]
      console.log('submission', submission.id)
      const yswsRecordID = submission?.fields?.ysws_db_record_id
      const submissionHours =
        submission?.fields?.['ship__chain__credited_hours']?.[0]
      const submissionTime = submission?.fields?.['ship__created_time']?.[0]
      if (
        !yswsRecordID ||
        !(Boolean(submissionHours) || submissionHours === 0) ||
        !submissionTime
      ) {
        console.log(
          'missing fields',
          yswsRecordID,
          submissionHours,
          submissionTime,
        )
        continue
      }
      new Promise((resolve) => setTimeout(resolve, 1000))
      const yswsRecord = await yswsBase('Approved Projects').find(yswsRecordID)
      if (!yswsRecord) {
        console.log('ysws record not found', yswsRecordID)
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

  new Promise((resolve) => setTimeout(resolve, 1000))
  await syncDirectedYswsGitHubLinkPresences()
}

async function syncDirectedYswsGitHubLinkPresences(): Promise<void> {
  await withLock('sync-directed-ysws-github-links', async () => {
    console.log('finding ysws to update')
    const fetchedHsRecs = await base('ships')
      .select({
        fields: ['repo_url'],
        filterByFormula: and(
          'reshipped_from = BLANK()',
          "OR(last_directed_ysws_gh_link_synced_at = BLANK(), DATETIME_DIFF(TODAY(), last_directed_ysws_gh_link_synced_at, 'days') > 1)",
          "NOT(for_ysws = 'high-seas')",
          "NOT(for_ysws = 'low-skies')",
          "NOT(for_ysws = 'pending_fraud_review')",
          "NOT(for_ysws = 'ship_link_broken')",
          "NOT(for_ysws = 'none')",
          "NOT(for_ysws = 'save for later')",
          'NOT(for_ysws = BLANK())',
          'LEN({repo_url}) < 500',
        ),
        // ASC will prioritize records will null (never synced), then prioritize oldest records
        sort: [
          { field: 'last_directed_ysws_gh_link_synced_at', direction: 'asc' },
        ],
        maxRecords: 10,
      })
      .all()

    if (fetchedHsRecs.length == 0) {
      console.log('No records to update!')
      return
    }

    const projectRepoLookup =
      'OR(' +
      fetchedHsRecs
        .map((a) => `{Code URL} = '${a.get('repo_url')?.replace(/'/g, "\\'")}'`)
        .join(',') +
      ')'
    const yswsRecord = await yswsBase('Approved Projects')
      .select({
        fields: ['Code URL'],
        filterByFormula: projectRepoLookup,
        maxRecords: 10,
      })
      .all()

    const recordsToUpdate = []
    for (const hsRec of fetchedHsRecs) {
      const updatedFields = {
        last_directed_ysws_gh_link_synced_at: new Date(),
      }

      const yswsDbMatchOnCodeUrl = yswsRecord.find(
        (yswsRec) => yswsRec.get('Code URL') === hsRec.get('repo_url'),
      )

      if (yswsDbMatchOnCodeUrl) {
        // Update time and link
        updatedFields['other_ysws_submitted_id'] = yswsDbMatchOnCodeUrl.id
      }

      console.log('Updating ', updatedFields)

      recordsToUpdate.push({
        id: hsRec.id,
        fields: updatedFields,
      })
    }

    await base('ships').update(recordsToUpdate)
  })
}
