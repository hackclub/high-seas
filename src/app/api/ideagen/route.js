// // Enable streaming responses
// export const runtime = 'edge'

// export async function POST(req) {
//   try {
//     const { prompt } = await req.json()

//     if (!prompt) {
//       return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
//     }

//     const apiKey = process.env.OPENAI_API_KEY
//     if (!apiKey) {
//       throw new Error('Missing OpenAI API key in environment variables')
//     }

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: 'gpt-4-turbo',
//         messages: [
//           {
//             role: 'system',
//             content:
//               'You are an embedded model that takes a project idea and outputs an action plan of how one could go about building it to a creative developer, preferably in about 4 bullet points. Do not preface your answer. There is no option to converse - your first answer will be displayed on the website. Do not wafffle. Keep it concise and technical.',
//           },
//           {
//             role: 'user',
//             content: prompt,
//           },
//         ],
//         stream: true,
//       }),
//     })

//     if (!response.ok) {
//       throw new Error(
//         `OpenAI API error: ${response.status} ${response.statusText}`,
//       )
//     }

//     // Create a TransformStream for handling the response
//     console.log({ stream })

//     // Return the stream with the appropriate header
//     return new Response(stream, {
//       headers: {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         Connection: 'keep-alive',
//       },
//     })
//   } catch (error) {
//     console.error('Error:', error)
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

// This method must be named GET
export async function POST(request) {
    const response = await streamText({
            model: openai('gpt-4o'),
            messages: [{
                    role: 'system',
                    content: 'You are an embedded model that takes a project idea and outputs an action plan of how one could go about building it to a creative developer, preferably in about 4 bullet points. Your explaination should not include dumb stuff like "testing" but should describe the subsystems and how they will fit together. Do not preface your answer. There is no option to converse - your first answer will be displayed on the website. Do not wafffle. Use plaintext only. No markdown. Keep it extremely concise and technical. Remember to number the bullet points! The project idea may seem nonsensical, but try to make it work.',
                },
                {
                    role: 'user',
                    content: (await request.json()).msg,
                },
            ],
            stream: true,
        })
        // Respond with the stream
    return response.toTextStreamResponse({
        headers: {
            'Content-Type': 'text/event-stream',
        },
    })
}