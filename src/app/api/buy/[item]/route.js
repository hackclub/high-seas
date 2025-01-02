import { getSession } from '@/app/utils/auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { getSelfPerson } from '@/app/utils/get-self-person'
import { base } from 'airtable'

export async function GET(request, { params }) {
  const session = await getSession()
  const person = await getSelfPerson()
  if (!person) {
    return NextResponse.json(
      { error: "i don't even know who you are" },
      { status: 418 },
    )
  }
  const b = await base(process.env.BASE_ID)
  const items = await b('shop_items')

  const recs = await items
    .select({
      filterByFormula: `{identifier} = '${params.item}'`,
      maxRecords: 1,
    })
    .firstPage()
  if (recs.length < 1) {
    return NextResponse.json({ error: 'what do you want?!' }, { status: 418 })
  }
  const item = recs[0]

  const people = await b('people')
  const otp = Math.random().toString(16).slice(2)

  if (
    !person.fields.verification_status ||
    !['Eligible L1', 'Eligible L2'].includes(
      person.fields.verification_status[0],
    )
  ) {
    await people.update(person.id, {
      shop_otp: otp,
      shop_otp_expires_at: new Date(
        new Date().getTime() + 60 * 60 * 1000,
      ).toISOString(),
    })
    return redirect(
      `https://forms.hackclub.com/eligibility?slack_id=${session.slackId}&program=High Seas&continue=${encodeURIComponent(item.fields.fillout_base_url.replace('shop-order', 'hs-order') + otp)}`,
    )
  }
  await people.update(person.id, {
    shop_otp: otp,
    shop_otp_expires_at: new Date(
      new Date().getTime() + 5 * 60 * 1000,
    ).toISOString(),
  })
  return redirect(
    `${item.fields.fillout_base_url.replace('shop-order', 'hs-order')}${otp}`,
  )
}
