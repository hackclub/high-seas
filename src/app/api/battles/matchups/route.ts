import { NextResponse } from 'next/server'
import {
  generateMatchup,
  generateTutorialMatchup,
} from '../../../../../lib/battles/matchupGenerator'
import { getSession } from '@/app/utils/auth'
import { getCachedProjects } from './get-cached-projects'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const isTutorial = request.nextUrl.searchParams.get('tutorial')

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let matchup
    if (isTutorial) {
      matchup = generateTutorialMatchup()
    } else {
      const projects = await getCachedProjects()
      const userSlackId = session.slackId

      // TODO: this filtering could happen in the generateMatchup function!
      const votableProjects = projects.filter(
        (project) => project?.['entrant__slack_id']?.[0] !== userSlackId,
      )
      matchup = await generateMatchup(votableProjects, userSlackId)
    }

    if (!matchup) {
      return NextResponse.json(
        { error: 'No valid matchup found' },
        { status: 404 },
      )
    }

    const rMatchup = {
      project1: {
        id: matchup.project1.id,
        title: matchup.project1.title,
        screenshot_url: matchup.project1.screenshot_url,
        readme_url: matchup.project1.readme_url,
        repo_url: matchup.project1.repo_url,
        deploy_url: matchup.project1.deploy_url,
        // rating: matchup.project1.rating,
        ship_type: matchup.project1.ship_type,
        update_description: matchup.project1.update_description,
        entrant__slack_id: matchup.project1.entrant__slack_id[0],
      },
      project2: {
        id: matchup.project2.id,
        title: matchup.project2.title,
        screenshot_url: matchup.project2.screenshot_url,
        readme_url: matchup.project2.readme_url,
        repo_url: matchup.project2.repo_url,
        deploy_url: matchup.project2.deploy_url,
        // rating: matchup.project2.rating,
        ship_type: matchup.project2.ship_type,
        update_description: matchup.project2.update_description,
        entrant__slack_id: matchup.project2.entrant__slack_id[0],
      },
      signature: matchup.signature,
      ts: matchup.ts,
    }

    return NextResponse.json(rMatchup)
  } catch (error) {
    console.error('Error generating matchup:', error)
    return NextResponse.json(
      { error: 'Failed to generate matchup' },
      { status: 500 },
    )
  }
}
