'use server'
import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.BASE_ID!,
)

export async function getStickyUrls(): string[] {
  const allStickies = (await base('sticky_holidays').select({}).all()).sort(
    (a, b) => a.fields.id - b.fields.id,
  )
  const safeStickies = allStickies.filter(
    (s) => new Date(s.fields.day).getTime() < Date.now(),
  )
  const urls = safeStickies.map((s) => s.fields.image_url)
  urls.push(allStickies[safeStickies.length].fields.blacked_image_url)
  return urls
}
