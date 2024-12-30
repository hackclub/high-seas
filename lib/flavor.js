export const sample = (arr, seed = '') => {
    const random = seed === '' ? Math.random() : pseudoRandom(seed)
    return arr[Math.floor(random * arr.length)]
}

export const loadingSpinners = ['compass.svg', 'skull.svg']
const loadingMsg = ['']

const pseudoRandom = (seed) => {
    return Math.sin(seed * 10000) / 2 + 0.5
}

export const zeroMessage = [
    'Arrr, ye be flat broke!',
    "Ye're as poor as a landlubber!",
    "Ye've got no doubloons!",
    "Can't buy nothin' with nothin'!",
]

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

export const shopBanner = [
    'buy something or get out!',
    'spend your doubloons here!',
    'get that booty!',
    'NO REFUNDS',
    'feeling overburdened by money?',
    'plundered from the best dead adventurers in the land',
    'we accept doubloons and PiratePay™',
    'YARR',
    '🏴‍☠️',
    "you wouldn't download a ship...",
    "These prices are walkin' the plank!",
]