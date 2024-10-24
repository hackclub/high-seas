export const sample = (arr, seed = '') => {
  const random = seed === '' ? Math.random() : pseudoRandom(seed)
  return arr[Math.floor(random * arr.length)]
}

export const loadingSpinners = [
  'https://cloud-be2txb6al-hack-club-bot.vercel.app/0dragon_loading-ezgif.com-resize.gif',
  // 'https://cloud-z5fi3gae4-hack-club-bot.vercel.app/1spinning-dragon.gif',
  'https://cloud-z5fi3gae4-hack-club-bot.vercel.app/2spyro-the-dragon-purple-dragon.gif',
  'https://cloud-10zf7idz5-hack-club-bot.vercel.app/0pokemon-dragonite-ezgif.com-optimize.gif',
  'https://cloud-10zf7idz5-hack-club-bot.vercel.app/1dfiohfj-cd42b6c2-b3f5-4304-9122-bf20544bc1b3-ezgif.com-optimize.gif',
  'https://cloud-10zf7idz5-hack-club-bot.vercel.app/3875bbd0d7c68fde03ee5433d7793f981-ezgif.com-optimize.gif',
  'https://cloud-10zf7idz5-hack-club-bot.vercel.app/5dhulh7y-964743a3-0cc3-4d38-9633-af55c405a4e0-ezgif.com-optimize.gif',
]
const loadingMsg = [
  ''
]

const pseudoRandom = (seed) => {
  return Math.sin(seed * 10000) / 2 + 0.5
}

export const purchaseWords = [
  // Don't uniquify this! Some are rarer than others
  "Acquire",
  "Acquire",
  "Buye",
  "Buye",
  "Obtain",
  "Obtain",
  "Procure",
  "Procure",
  "Purchafe",
]

export const shopBanner = [
  "buy something or get out!",
  "we have the best stuff scales can buy!",
  "put your finger on the scales",
  "NO REFUNDS",
  "Get that lute!",
  "Add to your hoard today!",
  "Add to your hoard, anything you can afford!",
  "Feeling overburdened by money?",
  "plundered from the best dead adventurers in the land",
  "all the sales, for your scales!",
  "NO RETURNS (◣ _ ◢)",
]
