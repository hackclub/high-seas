import { getSession } from '@/app/utils/auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { getSelfPerson } from '@/app/utils/airtable'
import { base } from 'airtable'

export async function GET(request, { params }) {
  const session = await getSession()
  const person = await getSelfPerson(session.slackId)

  if (!person) {
    return NextResponse.json(
      { error: "i don't even know who you are" },
      { status: 418 },
    )
  }

  const { region } = request.query
  const b = await base(process.env.BASE_ID)
  const items = await b('shop_items')

  const recs = await items
    .select({
      filterByFormula: `{identifier} = '${params.item}'`,
      maxRecords: 1,
    })
    .firstPage()

  if (recs.length < 1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 418 })
  }

  const item = recs[0]

  const { tickets } =
    await getPersonTicketBalanceAndTutorialStatutWowThisMethodNameSureIsLongPhew(
      session.slackId,
    )

  const price = region === 'us' ? item.fields.priceUs : item.fields.priceGlobal
  if (tickets < price) {
    return NextResponse.json(
      { error: 'Not enough doubloons to buy this item' },
      { status: 400 },
    )
  }

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
