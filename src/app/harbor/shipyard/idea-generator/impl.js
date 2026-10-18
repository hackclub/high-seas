'use client'

import { useEffect, useState } from 'react'
import { Howl } from 'howler'
import { init, generate } from './generator'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

let yap_sounds = {}
function loadYapSounds() {
  yap_sounds = {
    a: new Howl({ src: 'audio/yapping/a.wav' }),
    b: new Howl({ src: 'audio/yapping/b.wav' }),
    c: new Howl({ src: 'audio/yapping/c.wav' }),
    d: new Howl({ src: 'audio/yapping/d.wav' }),
    e: new Howl({ src: 'audio/yapping/e.wav' }),
    f: new Howl({ src: 'audio/yapping/f.wav' }),
    g: new Howl({ src: 'audio/yapping/g.wav' }),
    h: new Howl({ src: 'audio/yapping/h.wav' }),
    i: new Howl({ src: 'audio/yapping/i.wav' }),
    j: new Howl({ src: 'audio/yapping/j.wav' }),
    k: new Howl({ src: 'audio/yapping/k.wav' }),
    l: new Howl({ src: 'audio/yapping/l.wav' }),
    m: new Howl({ src: 'audio/yapping/m.wav' }),
    n: new Howl({ src: 'audio/yapping/n.wav' }),
    o: new Howl({ src: 'audio/yapping/o.wav' }),
    p: new Howl({ src: 'audio/yapping/p.wav' }),
    q: new Howl({ src: 'audio/yapping/q.wav' }),
    r: new Howl({ src: 'audio/yapping/r.wav' }),
    s: new Howl({ src: 'audio/yapping/s.wav' }),
    t: new Howl({ src: 'audio/yapping/t.wav' }),
    u: new Howl({ src: 'audio/yapping/u.wav' }),
    v: new Howl({ src: 'audio/yapping/v.wav' }),
    w: new Howl({ src: 'audio/yapping/w.wav' }),
    x: new Howl({ src: 'audio/yapping/x.wav' }),
    y: new Howl({ src: 'audio/yapping/y.wav' }),
    z: new Howl({ src: 'audio/yapping/z.wav' }),
    th: new Howl({ src: 'audio/yapping/th.wav' }),
    sh: new Howl({ src: 'audio/yapping/sh.wav' }),
    _: new Howl({ src: 'audio/yapping/_.wav' }),
  }
}

const soundKeys = Object.keys(yap_sounds)

async function yap(
  text,
  { letterCallback = () => {}, endCallback = () => {}, baseRate = 10, rateVariance = 1 } = {},
) {
  const yap_queue = []
  if (Object.keys(yap_sounds).length === 0) {
    loadYapSounds()
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const lowerChar = char?.toLowerCase()
    const prevChar = text[i - 1]
    const prevLowerChar = prevChar?.toLowerCase()
    const nextChar = text[i + 1]
    const nextLowerChar = nextChar?.toLowerCase()

    if (lowerChar === 's' && nextLowerChar === 'h') {
      yap_queue.push({ letter: char, sound: yap_sounds['sh'] })
      continue
    } else if (lowerChar === 't' && nextLowerChar === 'h') {
      yap_queue.push({ letter: char, sound: yap_sounds['th'] })
      continue
    } else if (lowerChar === 'h' && (prevLowerChar === 's' || prevLowerChar === 't')) {
      yap_queue.push({ letter: char, sound: yap_sounds['_'] })
      continue
    } else if (',?. '.includes(char)) {
      yap_queue.push({ letter: char, sound: yap_sounds['_'] })
      continue
    } else if (lowerChar === prevLowerChar) {
      yap_queue.push({ letter: char, sound: yap_sounds['_'] })
      continue
    }

    if (lowerChar.match(/[a-z.]/)) {
      yap_queue.push({ letter: char, sound: yap_sounds[lowerChar] })
      continue
    }

    yap_queue.push({ letter: char, sound: yap_sounds['_'] })
  }

  function next_yap() {
    if (yap_queue.length === 0) {
      console.log('yap done')
      endCallback()
      return
    }
    let { sound, letter } = yap_queue.shift()
    sound.rate(Math.random() * rateVariance + baseRate)
    sound.volume(1)
    sound.once('end', next_yap)
    sound.play()
    sound.once('play', () => {
      letterCallback({ sound, letter, length: yap_queue.length })
    })
  }

  next_yap()
}

const StreamingText = ({ msg }) => {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const playRandomSound = () => {
    const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)]
    const sound = yap_sounds[randomKey]
    sound.rate(Math.random() * 1 + 10) // Random rate between 10-11
    sound.volume(0.5)
    sound.play()
  }

  const fetchStreamingData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setText('')

      const response = await fetch('/api/ideagen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msg }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        let chunk = decoder.decode(value, { stream: true })

        playRandomSound()
        chunk = chunk.replace('\n', '<br /><br />')
        setText((prev) => prev + chunk)
      }
    } catch (err) {
      setError('Error fetching streaming data: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={fetchStreamingData} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'How can I build this? (Uses an LLM)'}
      </Button>

      {error && <div className="text-red-500 p-4">{error}</div>}

      <p className="p-4 max-w-prose" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}

const IdeaGenerator = () => {
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    init()
  }, [])

  const thinkingWords = [
    'thinking',
    'single neuron activated',
    '2 braincells rubbing together',
    'ponderosourus',
    'contemplatosaurus',
    'dinosaur brain activated',
    'rummaging through my thoughts',
    'scrounging around the bottom of the barrel',
    'pirating new ideas',
    'plundering the depths of my mind',
    'thinking up a storm',
    'torrenting new ideas',
  ]

  const generateIdea = async () => {
    if (typing || loading) return

    setLoading(true)

    let newIdea = ''

    try {
      const newIdea = generate()

      setTyping(true)
      setLoading(false)
      setMessage('')

      yap(newIdea, {
        letterCallback: ({ letter }) => {
          setMessage((prev) => prev + letter)
        },
        endCallback: () => {
          setTyping(false)
        },
      })
    } catch (error) {
      console.error('Error generating idea:', error)
      setLoading(false)
    }
  }

  const activeClass = loading ? 'thinking' : typing ? 'typing' : 'idle'
  const imgSrc = loading ? '/thinking.png' : typing ? '/talking.png' : '/idle.png'

  return (
    <>
      <Button className="mx-auto block" onClick={generateIdea}>
        Generate an idea
      </Button>
      <Modal isOpen={!!message} close={() => setMessage(null)}>
        <div className="flex flex-col items-center max-h-[70vh] overflow-y-auto">
          <p className="max-w-prose text-lg text-center mb-4">{message}</p>
          <Button onClick={loading ? null : generateIdea}>Regenerate</Button>
          <img
            src={imgSrc}
            className={`mb-12 max-w-1/2 ${activeClass} ${
              loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            alt="idea generator"
            onClick={loading ? null : generateIdea}
            style={{ pointerEvents: loading ? 'none' : 'auto' }}
          />

          <StreamingText msg={message} />
        </div>
      </Modal>
    </>
  )
}

export { IdeaGenerator }
