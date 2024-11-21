'use client'

import { useState } from 'react'

import './idea-generator.css'
import { sample } from '../../lib/flavor'
import { yap } from '../../lib/yap'

import { Howl } from 'howler'

const thinkingSounds = [
  new Howl({ src: 'audio/yapping/thonk1.wav' }),
  new Howl({ src: 'audio/yapping/thonk2.wav' }),
  new Howl({ src: 'audio/yapping/thonk3.wav' }),
]

const fetchIdea = async () => {
  const res = await fetch('/api/project_ideas', { method: 'POST' })
  const data = await res.json()
  return data
}

const IdeaGenerator = () => {
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [message, setMessage] = useState('')

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
    setMessage(sample(thinkingWords))
    sample(thinkingSounds).play()

    let newIdea = ''

    try {
      await Promise.all([
        fetchIdea().then((i) => {
          newIdea = i.idea
        }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ])

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
  const imgSrc = loading
    ? '/thinking.png'
    : typing
      ? '/talking.png'
      : '/idle.png'

  return (
    <div className="idea-generator flex flex-col justify-center items-center mb-24">
      <img
        src={imgSrc}
        className={`mb-4 ${activeClass} ${
          loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        alt="idea generator"
        onClick={loading ? null : generateIdea}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      />
      <span className="idea-box text-white w-64">{message}</span>
    </div>
  )
}

export { IdeaGenerator }
