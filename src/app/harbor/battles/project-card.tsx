import { useMemo, useState } from 'react'
import { Ships } from '../../../../types/battles/airtable'
import Image from 'next/image'
import Pill from '@/components/ui/pill'
import Icon from '@hackclub/icons'

const notFoundImages = [
  'https://cloud-6laa73jem-hack-club-bot.vercel.app/0not_found5.png',
  'https://cloud-6laa73jem-hack-club-bot.vercel.app/1not_found4.png',
  'https://cloud-6laa73jem-hack-club-bot.vercel.app/2not_found3.png',
  'https://cloud-6laa73jem-hack-club-bot.vercel.app/3not_found2.png',
  'https://cloud-6laa73jem-hack-club-bot.vercel.app/4not_found1.png',
]

export default function ProjectCard({
  project,
  onVote,
  onReadmeClick,
  setAnalyticsState,
  onFraudClick,
}: {
  project: Ships
  onVote: () => void
  onReadmeClick: () => void
  setAnalyticsState: any
  onFraudClick: any
}) {
  const notFoundImage = useMemo(() => {
    return notFoundImages[Math.floor(Math.random() * notFoundImages.length)]
  }, [])
  const imageStyle = {
    backgroundImage: `url(${notFoundImage})`,
    backgroundSize: 'cover',
  }
  const [showFullText, setShowFullText] = useState(false)

  const toggleReadMore = () => {
    setShowFullText((prev) => !prev)
  }

  const truncatedText = project.update_description?.slice(0, 50)

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      {project.screenshot_url && (
        <div className="relative h-48 w-full" style={imageStyle}>
          <Image
            src={project.screenshot_url}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="font-heading text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
          {project.title}
          {project.ship_type === 'update' ? (
            <p className="text-gray-600 dark:text-gray-300 mb-4 inline">
              {' '}
              <Pill
                msg="This is a project update"
                color="green"
                glyph="rep"
                classes="text-lg"
              />
            </p>
          ) : null}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.repo_url && (
            <a
              id="repository-link"
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      repoOpened: true,
                    },
                  },
                }))
              }}
              onAuxClick={(e) => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      repoOpened: true,
                    },
                  },
                }))
              }}
              onContextMenu={(e) => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      repoOpened: true,
                    },
                  },
                }))
              }}
            >
              <Pill
                msg="Repository"
                color="blue"
                glyph="code"
                classes="text-lg"
              />
            </a>
          )}
          {project.deploy_url && (
            <a
              id="live-demo-link"
              href={project.deploy_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      demoOpened: true,
                    },
                  },
                }))
              }}
              onAuxClick={(e) => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      demoOpened: true,
                    },
                  },
                }))
              }}
              onContextMenu={(e) => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      demoOpened: true,
                    },
                  },
                }))
              }}
            >
              <Pill msg="Demo" color="green" glyph="link" classes="text-lg" />
            </a>
          )}
          {project.readme_url && (
            <button
              onClick={() => {
                setAnalyticsState((prev) => ({
                  ...prev,
                  projectResources: {
                    ...prev.projectResources,
                    [project.id]: {
                      readmeOpened: false,
                      repoOpened: false,
                      demoOpened: false,
                      ...prev.projectResources[project.id],
                      readmeOpened: true,
                    },
                  },
                }))
                onReadmeClick()
              }}
              id="readme-button"
            >
              <Pill msg="README" glyph="docs-fill" classes="text-lg" />
            </button>
          )}
        </div>
        {project.update_description && (
          <p className="mt-4">
            {showFullText
              ? project.update_description
              : truncatedText +
                (project.update_description.length > 50 ? '...' : '')}
            {project.update_description.length > 50 && (
              <button
                className="text-blue-500 ml-2 underline"
                onClick={toggleReadMore}
              >
                {showFullText ? 'Read Less' : 'Read More'}
              </button>
            )}
          </p>
        )}
        <a
          target="_blank"
          href={`https://hackclub.slack.com/team/${project.entrant__slack_id}`}
        >
          <Pill glyph="slack" color="purple" msg="Chat on Slack" />
        </a>
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-700">
        <button
          id="vote-button"
          onClick={onVote}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Icon glyph="thumbsup-fill" size={32} /> Vote for {project.title}
        </button>

        <button
          onClick={() => onFraudClick(project)}
          className="flex gap-1 items-center mt-3 mx-auto text-xs p-1 px-2 rounded bg-red-100"
        >
          <Icon glyph="flag" size={20} />
          Flag project
        </button>
      </div>
    </div>
  )
}
