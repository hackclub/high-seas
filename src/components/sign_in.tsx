import { headers } from 'next/headers'

export default async function SignIn({
  variant = 'default',
  session,
}: {
  variant: 'small' | 'default'
  session: any
}) {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const proto = headersList.get('x-forwarded-proto') || 'http'
  const origin = encodeURIComponent(`${proto}://${host}`)

  const slackAuthUrl = `https://hackclub.slack.com/oauth/v2/authorize?scope=&user_scope=openid%2Cprofile%2Cemail&redirect_uri=${origin}/api/slack_redirect&client_id=${process.env.SLACK_CLIENT_ID}`

  const textSize = variant === 'small' ? 'text-base' : 'text-2xl'
  return (
    <a
      className={`bg-white text-black p-2 px-3 sm:px-6 w-fit rounded-lg ${textSize} linkPop`}
      href={session ? '/signpost' : slackAuthUrl}
    >
      {session ? 'Enter the Harbor' : "Already in Hack Club's Slack?"}
    </a>
  )
}
