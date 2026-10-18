import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

// This method must be named GET
export async function POST(request) {
  const response = streamText({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'system',
        content:
          'You are an embedded model that takes a project idea and outputs an action plan of how one could go about building it to a creative developer, preferably in about 4 bullet points. Your explaination should not include dumb stuff like "testing" but should describe the subsystems and how they will fit together. Do not preface your answer. There is no option to converse - your first answer will be displayed on the website. Do not wafffle. Use plaintext only. No markdown. Keep it extremely concise and technical. Remember to number the bullet points!',
      },
      {
        role: 'user',
        content: (await request.json()).msg,
      },
    ],
  })
  // Respond with the stream
  return response.toTextStreamResponse({
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
