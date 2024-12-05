import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { get } from '@vercel/edge-config'
import { getSession, HsSession } from './app/utils/auth'
import {
  fetchShips,
  fetchSignpostFeed,
  fetchWaka,
  fetchShopItems,
  person,
} from './app/utils/data'

async function loadShipsCookie(
  request: NextRequest,
  slackId: string,
  response: NextResponse,
) {
  // Ships base
  try {
    const shipyardPage = request.nextUrl.pathname.startsWith('/shipyard')
    if (shipyardPage && !request.cookies.get('ships')) {
      const ships = await fetchShips(slackId, 2)
      response.cookies.set({
        name: 'ships',
        value: JSON.stringify(
          ships.map((s) => {
            if (s.screenshotUrl.startsWith('data:'))
              s.screenshotUrl = `replace_me_with_a_non_dataencoded_url_plz`
            return s
          }),
        ),
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + 5 * 60 * 1000), // In 5 mins
      })
    }
  } catch (e) {
    console.error('Middleware errored on ships cookie step', e)
  }
}

async function loadWakaCookie(
  request: NextRequest,
  session: HsSession,
  response: NextResponse,
) {
  try {
    console.log('Checking for waka cookie')
    if (!request.cookies.get('waka')) {
      const wakaData = await fetchWaka(session)
      let expiration = 60 * 60 * 1000 // In 1 hour
      if (wakaData?.hasHb) {
        expiration = 7 * 24 * 60 * 60 * 1000 // In 7 days
      }
      response.cookies.set({
        name: 'waka',
        value: JSON.stringify(wakaData),
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + expiration),
      })
    }
  } catch (e) {
    console.error('Middleware errored on waka cookie step', e)
  }
}

async function loadSignpostFeedCookie(
  request: NextRequest,
  response: NextResponse,
) {
  // Signpost base
  try {
    console.log('Checking for signpost-feed cookie')
    const signpostPage = request.nextUrl.pathname.startsWith('/signpost')
    if (signpostPage && !request.cookies.get('signpost-feed')) {
      const signpostFeed = await fetchSignpostFeed()
      response.cookies.set({
        name: 'signpost-feed',
        value: JSON.stringify(signpostFeed),
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + 30 * 60 * 1000), // In 30 minutes
      })
    }
  } catch (e) {
    console.error('Middleware errored on signpost-feed cookie step', e)
  }
}

async function loadPersonCookies(request: NextRequest, response: NextResponse) {
  // Person base
  try {
    if (
      !request.cookies.get('tickets') ||
      !request.cookies.get('verification') ||
      !request.cookies.get('academy-completed')
    ) {
      const p = (await person()).fields

      const tickets = Number(p['settled_tickets'])
      response.cookies.set({
        name: 'tickets',
        value: JSON.stringify(tickets),
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + 5 * 60 * 1000), // In 5 minutes
      })

      const verificationStatus = p['verification_status'][0]
      const verificationReason = p['Rejection Reason']
      let verifExpiration = 5 * 60 * 1000
      if (verificationStatus.startsWith('Eligible')) {
        verifExpiration = 24 * 60 * 60 * 1000 // In 1 day
      }
      response.cookies.set({
        name: 'verification',
        value: JSON.stringify({
          status: verificationStatus,
          reason: verificationReason,
        }),
        path: '/',
        expires: new Date(Date.now() + verifExpiration),
      })

      const academyCompleted = p['academy_completed'] === true
      let acadExpiration = 60 * 60 * 1000 // In 1 hour
      if (academyCompleted) {
        acadExpiration = 7 * 24 * 60 * 60 * 1000 // In 7 days
      }
      response.cookies.set({
        name: 'academy-completed',
        value: JSON.stringify(academyCompleted),
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + acadExpiration),
      })
    }
  } catch (e) {
    console.error('Middleware errored on person cookie step', e)
  }
}

// async function loadShopItemsCookie(
//   request: NextRequest,
//   response: NextResponse,
// ) {
//   try {
//     if (!request.cookies.get('shop')) {
//       const shopItems = await fetchShopItems()
//       console.log(shopItems.map((a) => [a.name, a.priceUs, a.priceGlobal]))
//       response.cookies.set({
//         name: 'shop',
//         value: JSON.stringify(
//           shopItems.map((a) => [a.name, a.priceUs, a.priceGlobal]),
//         ),
//         path: '/',
//         sameSite: 'strict',
//         expires: new Date(Date.now() + 60 * 60 * 1000), // In an hour
//       })
//     }
//   } catch (e) {
//     console.error('Middleware errored on shop items cookie step', e)
//   }
// }

export async function userPageMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  const session = await getSession()
  const banlist = (await get('banlist')) as string[]

  const email = session?.email
  const slackId = session?.slackId
  if (!slackId || !email) return response

  if (banlist.includes(email)) {
    const redir = NextResponse.redirect(new URL('/', request.url))
    request.cookies
      .getAll()
      .forEach((cookie) => redir.cookies.delete(cookie.name))

    console.log('Banned', email)
    return redir
  }

  await Promise.all([
    loadShipsCookie(request, slackId, response),
    loadWakaCookie(request, session, response),
    loadSignpostFeedCookie(request, response),
    loadPersonCookies(request, response),
    // loadShopItemsCookie(request, response),
  ])

  return response
}

const cronjobMiddleware = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      { success: false, message: 'authentication failed' },
      { status: 401 },
    )
  }
  return NextResponse.next()
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/cron')) {
    return cronjobMiddleware(request)
  } else {
    return userPageMiddleware(request)
  }
}

export const config = {
  matcher: ['/signpost', '/shipyard', '/wonderdome', '/shop', '/api/cron/'],
}
