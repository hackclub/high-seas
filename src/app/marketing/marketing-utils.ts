'use server'
import { headers } from 'next/headers'
import Airtable from 'airtable'
import { createWaka } from '../utils/waka'
import { getSession } from '../utils/auth'

// import createBackgroundJob from '../api/cron/create-background-job'

const highSeasPeopleTable = () => {
  const highSeasBaseId = process.env.BASE_ID
  if (!highSeasBaseId) throw new Error('No Base ID env var set')
  return Airtable.base(highSeasBaseId)('tblfTzYVqvDJlIYUB')
}

export async function handleEmailSubmission(
  email: string,
  isMobile: boolean,
  userAgent: string,
  urlParams: string,
): Promise<{
  username: string
  key: string
} | null> {
  if (!email) throw new Error('No email supplied to handleEmailSubmission')
  if (!userAgent)
    throw new Error('No user agent supplied to handleEmailSubmission')

  const ipAddress = headers().get('x-forwarded-for')

  const [session, _backgroundJob] = await Promise.all([
    getSession(),
    createBackgroundJob('invite', { email, ipAddress, userAgent, isMobile }),
  ])

  const slackId = session?.slackId

  const signup = await createWaka(email, null, slackId)
  const { username, key } = signup

  if (username) {
    await createBackgroundJob('create_person', {
      email,
      ipAddress,
      isMobile,
      username,
      urlParams,
    })
  }

  return {
    username,
    key,
  }
}
