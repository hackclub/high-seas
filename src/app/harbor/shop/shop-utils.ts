'use server'

import Airtable from 'airtable'
import { getSession } from '@/app/utils/auth'
import { getSelfPerson } from '@/app/utils/server/airtable'
import { NextResponse } from 'next/server'
import { cached } from '../../../../lib/redis-cache'

const base = () => {
  const baseId = process.env.BASE_ID
  if (!baseId) throw new Error('No Base ID env var set')

  return Airtable.base(baseId)
}

export interface ShopItem {
  id: string
  name: string
  subtitle: string | null
  imageUrl: string | null
  enabledUs: boolean | null
  enabledEu: boolean | null
  enabledIn: boolean | null
  enabledXx: boolean | null
  enabledCa: boolean | null
  enabledAll: boolean | null
  enabledAu: boolean | null
  priceUs: number
  priceGlobal: number
  fulfilledAtEnd: boolean
  comingSoon: boolean
  outOfStock: boolean
  minimumHoursEstimated: number
  maximumHoursEstimated: number
  description: string | null
  customs_likely: boolean | null
  fulfillment_description: string | null
  links: string[] | null[]
  limited_qty: boolean | null
}

export async function getShop(): Promise<ShopItem[]> {
  const items: ShopItem[] = []

  const session = await getSession()
  if (!('slackId' in session)) {
    return
  }
  const person = await getSelfPerson(session.slackId)
  const filter = person.fields.academy_completed
    ? '{enabled_main_game}'
    : '{enabled_high_seas}'

  const lookup = new Promise((resolve, reject) => {
    base()('shop_items')
      .select({
        filterByFormula: `AND(
          unlisted = FALSE(),
          ${filter} = TRUE()
        )`,
        sort: [{ field: 'tickets_us', direction: 'asc' }],
      })
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            items.push({
              id: record.get('identifier') as string,
              name: record.get('name') as string,
              subtitle: record.get('subtitle') as string | null,
              imageUrl: record.get('image_url') as string | null,
              enabledUs: Boolean(record.get('enabled_us')) as boolean,
              enabledEu: Boolean(record.get('enabled_eu')) as boolean,
              enabledIn: Boolean(record.get('enabled_in')) as boolean,
              enabledXx: Boolean(record.get('enabled_xx')) as boolean,
              enabledCa: Boolean(record.get('enabled_ca')) as boolean,
              enabledAll: Boolean(record.get('enabled_all')) as boolean,
              enabledAu: Boolean(record.get('enabled_au')) as boolean,
              priceUs: Number(record.get('tickets_us')) as number,
              priceGlobal: Number(record.get('tickets_global')) as number,
              fulfilledAtEnd: Boolean(
                record.get('fulfilled_at_end'),
              ) as boolean,
              comingSoon: Boolean(record.get('coming_soon')) as boolean,
              outOfStock: Boolean(record.get('out_of_stock')) as boolean,
              minimumHoursEstimated: Number(
                record.get('minimum_hours_estimated'),
              ),
              maximumHoursEstimated: Number(
                record.get('maximum_hours_estimated'),
              ),
              description: record.get('description') as string | null,
              customs_likely: Boolean(record.get('customs_likely')) as boolean,
              fulfillment_description: record.get('fulfillment_description') as
                | string
                | null,
              links: [
                record.get('third_party_link_us') as string,
                record.get('third_party_link_eu') as string,
                record.get('third_party_link_in') as string,
                record.get('third_party_link_ca') as string,
              ],
              limited_qty: Boolean(record.get('limited_qty')) as boolean,
            })
          })

          fetchNextPage()
        },
        (err) => (err ? reject(err) : resolve(items)),
      )
  })

  return await cached('shop_items.' + filter, async () => await lookup, 10 * 60)
}
