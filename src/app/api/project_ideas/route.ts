import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { sample } from '../../../../lib/flavor'
import OpenAI from 'openai'

const randomThings = [
  'karaoke',
  'browser extension',
  'fidget spinner',
  'puzzle',
  'game',
  'song',
  't-shirt',
  'comic',
  'song',
  'novel',
  'album',
  'snack',
  'smoothie',
  'book',
  'dance',
  'tv show',
  'cards',
  'candy',
  'remote control',
  'website',
  'parrot',
  'secret treasure',
  'eyepatch',
]

const messageStarters = [
  'you could build a',
  'you ever hear the tall tale of the',
  "I once had a capt'n tell me about a",
  'Arrrr, how about a',
  'Ahoy matey, what if you made a',
  'how about a',
  'you could make a',
  'as a dino, i think you should build a',
  'as a pirate, i think you should build a',
  'yarr, how about a',
  'picture this:',
  'oh, oh, oh! a',
  'i dare you to make a',
]

const generateKeywords = () => {
  if (Math.random() < 0.9) {
    return ''
  }

  const keywords = [
    sample(randomThings),
    sample(randomThings),
    sample(randomThings),
  ]
  return `To give you some ideas, here are some random things you can use: ${keywords.join(', ')}`
}

const bannedThings = [
  'pet rock', // not sure why, but it really wants to suggest pet rocks
  'illegal piracy', // it's getting confused with the pirate theme
]

const prompt = `You are a software engineer who wants to bring joy through chaos.
${Math.random() > 0.7 ? "You are also dressed up as a pirate, but that doesn't influence what you want to build- you just speak in pirate." : ''}
Come up with something different every time.
Please propose a funky simple software project that will take under 6 hours to complete in 1 quick sentence.
Don't do hardware projects, only software.
Keep it at less than 15 words.
The funkier, stupidier, and sillier your ideas the better.
Think out of the box, and do not propose ideas that do nothing but generate text, like a joke or dance move generator.
Random sound effect generators are boring, do not suggest them.
Be very creative, do not suggest projects that are too simple.
Don't suggest anything too offensive or inappropriate such as slurs.
Your idea should not involve any of the following concepts: ${bannedThings.map((i) => `"${i}"`).join(', ')}.
Your response must start with "${sample(messageStarters)}".
${generateKeywords()}`

const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']

const generateIdeas = async () => {
  const model = sample(models)
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: model,
  })
  const result = chatCompletion.choices[0].message.content
  if (result) {
    await saveIdeaToAirtable(result, model, prompt)
  }
  return result
}

const saveIdeaToAirtable = async (
  idea: string,
  model: string,
  prompt: string,
) => {
  try {
    const result = await fetch(
      'https://middleman.hackclub.com/airtable/v0/appQ6GyueRp5jqc9Q/high_seas_project_ideas',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'highseas.hackclub.com (project ideas)',
        },
        body: JSON.stringify({
          fields: {
            model,
            prompt,
            idea,
          },
        }),
      },
    ).then((r) => r.text())
  } catch (e) {
    console.error(e)
    // this is just for caching a couple project ideas and it's non-critical if it fails
  }
}

export async function POST(request: NextRequest) {
  const idea = await generateIdeas()

  return NextResponse.json({ idea }, { status: 200 })
}
