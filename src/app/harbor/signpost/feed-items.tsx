'use client'

import { SignpostFeedItem } from '@/app/utils/data'
import JaggedCardSmall from '@/components/jagged-card-small'
import Cookies from 'js-cookie'
import Markdown from 'react-markdown'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

export default function FeedItems() {
  const cookie = Cookies.get('signpost-feed')
  if (!cookie) return null

  let feedItems: SignpostFeedItem[]
  try {
    feedItems = JSON.parse(cookie).sort((a, b) => a?.autonumber < b?.autonumber)
  } catch (e) {
    console.error("Could't parse signpost feed cookie into JSON:", e)
    return null
  }

  if (!feedItems || feedItems.length === 0) {
    return <p>No changelog posts yet! Check back soon.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {feedItems.map((item, idx) => {
        return (
          <a key={idx} className="block" href={item.link ?? '#'}>
            <JaggedCardSmall bgColor="white">
              <p className="text-sm opacity-50 and">
                {timeAgo.format(new Date(item.createdTime))}
              </p>
              <p>
                <Markdown>{item.title}</Markdown>
              </p>
            </JaggedCardSmall>
          </a>
        )
      })}
    </div>
  )
}
