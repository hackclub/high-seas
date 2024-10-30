'use client'

import { useState } from "react"
import { Howl } from 'howler';

import './idea-generator.css';
import { sample } from "../../lib/flavor";

const fetchIdea = async () => {
  const res = await fetch('/api/project_ideas', { method: 'POST' });
  const data = await res.json();
  return data
}

const thinkingSounds = [
  new Howl({ src: 'audio/yapping/thonk1.wav' }),
  new Howl({ src: 'audio/yapping/thonk2.wav' }),
  new Howl({ src: 'audio/yapping/thonk3.wav' }),
]

const yap_sounds = {
  // these sounds and most of the yapping code are adapted from https://github.com/equalo-official/animalese-generator
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
  _: new Howl({ src: 'audio/yapping/_.wav' })
}

async function yap(text, {
  letterCallback = () => { },
  endCallback = () => { },
  baseRate = 3.2,
  rateVariance = 1,
} = {}) {

  const yap_queue = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const lowerChar = char?.toLowerCase()
    const prevChar = text[i - 1]
    const prevLowerChar = prevChar?.toLowerCase()
    const nextChar = text[i + 1]
    const nextLowerChar = nextChar?.toLowerCase()

    if (lowerChar === 's' && nextLowerChar === 'h') { // test for 'sh' sound
      yap_queue.push({ letter: char, sound: yap_sounds['sh'] });
      continue;
    } else if (lowerChar === 't' && nextLowerChar === 'h') { // test for 'th' sound
      yap_queue.push({ letter: char, sound: yap_sounds['th'] });
      continue;
    } else if (lowerChar === 'h' && (prevLowerChar === 's' || prevLowerChar === 't')) { // test if previous letter was 's' or 't' and current letter is 'h'
      yap_queue.push({ letter: char, sound: yap_sounds['_'] });
      continue;
    } else if (',?. '.includes(char)) {
      yap_queue.push({ letter: char, sound: yap_sounds['_'] });
      continue;
    } else if (lowerChar === prevLowerChar) { // skip repeat letters
      yap_queue.push({ letter: char, sound: yap_sounds['_'] });
      continue;
    }

    if (lowerChar.match(/[a-z.]/)) {
      yap_queue.push({ letter: char, sound: yap_sounds[lowerChar] })
      continue; // skip characters that are not letters or periods
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

  next_yap();
}

const IdeaGenerator = () => {
  // const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [message, setMessage] = useState('');

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
    if (typing) return;
    setLoading(true);
    setMessage(sample(thinkingWords))
    sample(thinkingSounds).play()
    let newIdea = ''
    await Promise.all([
      fetchIdea().then(i => {newIdea = i.idea}),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
    setTyping(true);
    setLoading(false);
    setMessage('')
    yap(newIdea, {
      letterCallback: ({ letter }) => {
        setMessage(prev => prev + letter)
      },
      endCallback: () => {
        setTyping(false);
      }
    })
  }

  const activeClass = loading ? 'thinking' : (typing ? 'typing' : 'idle');
  const imgSrc = loading ? '/thinking.png' : (typing ? '/talking.png' : '/idle.png');

  return (
    <div className="idea-generator flex flex-col justify-center items-center mb-24">
      <img src={imgSrc} className={`mb-4 ${activeClass}`} alt="idea generator" onClick={() => generateIdea()} />
      <span className="idea-box text-white w-64">{message}</span>
    </div>
  )
}

export { IdeaGenerator }