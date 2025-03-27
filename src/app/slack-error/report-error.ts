'use server'

import { orThrow } from '@/lib/utils'
import Airtable from 'airtable'

export const reportError = async (e: string) => {
  console.log('reporting error')
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
    endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
  }).base(process.env.BASE_ID ?? orThrow("No BASE_ID set"))

  base('non_user_in_slack').create(
    [
      {
        fields: {
          error: e,
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err)
        return
      }
    },
  )
}
