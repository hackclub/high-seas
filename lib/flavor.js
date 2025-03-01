export const sample = (arr, seed = '') => {
  const random = seed === '' ? Math.random() : pseudoRandom(seed)
  return arr[Math.floor(random * arr.length)]
}

export const bound = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

export const loadingSpinners = ['compass.svg', 'skull.svg']

const pseudoRandom = (seed) => {
  return Math.sin(seed * 10000) / 2 + 0.5
}

export const zeroMessage = [
  'Arrr, ye be flat broke!',
  "Ye're as poor as a landlubber!",
  "Ye've got no doubloons!",
  "Can't buy nothin' with nothin'!",
]

// export const shopBlessed = [
//   "Blimey! You got a blessing, didja? Well that's gotta do good for business seeing such upstanding pirate folk shoping here.",
//   "Wow! You got the boon of a pirate's blessing!",
//   `Blimey, a pirate's blessing! *She ${transcript('superstitions')}, according to pirate tradition.* Please, shop to your heart's content!`,
// ]

export const purchaseWords = [
  // Don't uniquify this! Some are rarer than others
  'Acquire',
  'Acquire',
  'Buye',
  'Buye',
  'Obtain',
  'Obtain',
  'Procure',
  'Procure',
  'Steal',
  'Summon',
  'Plunder',
  'Plunder',
  'Plunder',
  'BitTorrent',
  'Loot',
]

export const cantAffordWords = [
  'too expensive...',
  // "can't afford this...",
  "can't afford...",
  'unaffordable...',
  'out of reach...',
  'need doubloons...',
  'too pricey...',
  'not quite yet...',
  // "when you're richer...",
]

export const shopIcons = {
  freaking: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/0freaking.png',
  ded: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/1ded.png',
  info: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/2info.png',
  peefest: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/3pf.png',
  threat: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/4threatened.png',
  reading: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/5reading_2.png',
  reading2: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/6reading.png',
  scallywag: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/7scallywag.png',
  search: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/8searching_2.png',
  search2: 'https://cloud-iz667ljca-hack-club-bot.vercel.app/9searching.png',
  question: 'https://cloud-nfmmdwony-hack-club-bot.vercel.app/0000.png',
  cute: 'https://cloud-nfmmdwony-hack-club-bot.vercel.app/3003.png',
  tinfoil: 'https://cloud-nfmmdwony-hack-club-bot.vercel.app/4004.png',
  holdingEars: 'https://cloud-nfmmdwony-hack-club-bot.vercel.app/4004.png', // todo: draw this
  notamused: 'https://cloud-nfmmdwony-hack-club-bot.vercel.app/4004.png', // todo: draw this
  woah: 'https://cloud-e9zuzn0u0-hack-club-bot.vercel.app/3003.png',
  thumbs: 'https://cloud-r04a8za6c-hack-club-bot.vercel.app/1001.png',
  fluster:
    'https://cloud-3wb98dblo-hack-club-bot.vercel.app/0untitled_artwork.gif',
  bapanada:
    'https://cloud-o4qa8261z-hack-club-bot.vercel.app/0270a4575-6fa8-4946-b5c8-3fb5b8d9b722-1660621656235.webp',
  sticker: 'https://cloud-jckns370p-hack-club-bot.vercel.app/0find_out.png',
  stickerSheet: 'https://cloud-opr8cwuhm-hack-club-bot.vercel.app/0the-bin.png',
  sticker2: 'https://cloud-4wvt8n7o9-hack-club-bot.vercel.app/0heidiflag.png',
}

export const outOfStock = [
  "icon:question|where'd all the stock go?",
  'icon:question|come back when more washes up on shore',
]
