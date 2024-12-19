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

export const shopGreeting = [
  'Ahh, my favorite customer!',
  'raccoon has wares if you have coin!',
  'have a pretty penny you want to spend?',
  'your pockets look shiny today!',
  'that coinpurse looks heavy, let me help you with that.',
  "I have a feeling you're going to like what you see today.",
  'Hey there! You look like you could use some help.',
]

export const shopGetOut = [
  'Getouttahere!',
  'out out out!',
  'Get out!',
  'Come back once you got gold!',
  'whaddya take me for? wonathose nonprofit thingymajigs?',
  "you tryin ta steal from a thief! what's the world coming to!",
  "you can't take this stuff, i stole it fare and square!",
  'you trying to pull my tail?!',
]

export const shopNoMoney = [
  "wait, you don't have any doubloons?!",
  "hold up, I can't smell any coin on you!",
  "hang on, where's the doubloons?",
  "wwwwaaitaminute... you don't got any doubloons?",
  "how much you got... wait, you don't got any doubloons?",
]

const salvagedItems = [
  'coconuts',
  'seaturtles',
  'a broken compass',
  'driftwood',
  'seaweed',
  'an old boot',
  'an empty bottle',
  'a half-eaten fish',
  'a rusty hook',
]

export const storytime = [
  `so there i was, marrooned out on skull island... with nothing but ${sample(salvagedItems)} to keep me company... and a parrot that wouldn't stop talking about ${sample(salvagedItems)}...`,
  `so there i was, marrooned out on skull island... with nothing but ${sample(salvagedItems)} to keep me company... and some imaginary friend who I kept trying to sell stuff to`,
  "I've been marrooned on this island, please send help",
]

export const selfClick = [
  'stop that!',
  'oi! hands off',
  'paws off!',
  'hands to yourself buddy!',
  'Shoo! get! go take a long walk on a short plank!',
  'Oi! Hands off the merchandise!',
  'Get your filthy mitts off the tail! I just groomed last month!',
]

const pirateyThings = [
  'bilge rat',
  'salty dog',
  'scurvy dog',
  'scallywag',
  'landlubber',
  'scurvy swashbuckler',
  'scurvy pirate',
  'scurvy sea dog',
  'scurvy sea rat',
  'scurvy sea scoundrel',
  'scurvy rat',
  'scurvy scallywag',
]

const superstitionItems = [
  'black cat',
  "rabbit's foot",
  'whole rabbit',
  'broken mirror',
  'ladder',
  'whole salt shaker',
  'four-leaf clover',
  'three-leaf clover with an extra leaf taped on',
  'horseshoe',
  'whole leprechaun (not just the bones)',
  'lucky coin',
  'pinch of salt',
  "monkey's paw",
]

const superstitions = [
  'spits over shoulder',
  'spins around three times',
  'knocks on wood',
  'throws salt over shoulder',
  'crosses fingers',
  'signs the cross with her tail',
  'spits in her hat',
  "grabs a rabbit's foot",
  `throws a ${sample(superstitionItems)} over her shoulder`, // be careful. this one... is pretty out there
]

const domains = [
  'eelslap.com',
  'endless.horse',
  'puginarug.com',
  'zombo.com',
  'heeeeeeeey.com',
  'fallingfalling.com',
]

export const cursedShopkeeper = [
  `Blimey! You've been cursed? *${sample(superstitions)} and then *${sample(superstitions)}*`,
  `Ye've been cursed? *${sample(superstitions)} and then *${sample(superstitions)}*`,
  "By the seven seas! You've been cursed? *spits over shoulder*",
  `You've been cursed?! Get off me island you ${sample(pirateyThings)}!`,
  "Hang on, you're cursed? Go take a long walk off a short plank!",
]

export const items = {
  dial_caliper: [
    'icon:infoRaccoon|just like I always says: measure twice, |icon:scallywagRaccoon|stab once!',
    "You'll like the cut of your jib, now that you can measure it!",
    'dial it in, matey!',
    'now you can measure the distance between you and the treasure!',
    'great for measuring the distance between you and the plank!',
    'great for making sure you get an accurate measure when you take a long walk off a short plank!',
    "icon:scallywagRaccoon|shaped just like me first mate's hook!",
    'icon:scallywagRaccoon|i just use me eye, but this be a fine tool!',
    'icon:scallywagRaccoon|a fine tool for measuring the length of a plank!',
    "icon:scallywagRaccoon|ever been pinched by a crab's claws?|icon:questionRaccoon|pause| No?|icon:infoRaccoon|pause| Well, nevermind then",
  ],
  domain: [
    `icon:scallywagRaccoon|elp make the next ${sample(domains)}!`,
    `icon:scallywagRaccoon|Hoist the sails, we're off to ${sample(domains)}!`,
    `icon:searchingRaccoon|Navigator, set sail for ${sample(domains)}!`,
    `icon:infoRaccoon|There's a joke in here about pirates and websites, |icon:questionRaccoon|but I can't think of it.`,
  ],
  zine: [
    "icon:readingRaccoon|I can't read, but i like the pictures!",
    'icon:freakingRaccoon|speed:4.1|OMGWTFBBQ, JULIA EVANS MADE THESE!|pause:300| .|pause:300| .|pause:300| .|icon:questionRaccoon|speed:3|EErrrr, I mean,|icon:scallywagRaccoon|speed:default|arrrr, set sail on a good story!',
    'icon:scallywagRaccoon|A fine piece of literature, this be!',
    'icon:scallywagRaccoon|My first mate reads these to me!',
    'icon:readingRaccoon|You can even read it with an eyepatch!',
  ],
  ham_radio: [
    'waaaaay better than a smoke signal!',
    'I got one to replace me parrot! Way less bitey',
    "don't even have to learn semaphore!",
    'speak to yer mateys from miles away!',
    "squacks like a parrot, but doesn't mutiny as much!",
  ],
  stickers: [
    "puts the 'arrr' in 'stickarrr'!",
    "stick 'em on your ship, stick 'em on your crew!",
    "puts the 'stick' in 'stick 'em up!'",
    "puts the 'stick' in 'stick 'em with the pointy end!'",
    "puts the 'ad' in 'adhesive'!",
  ],
  hot_glue_gun: [
    'will patch anything up to and including a cannon hole in the hull or your money back!',
    'great for tinkering!',
    "not as good as a real flintlock, but it'll do in a pinch!",
    'never bring a sword to a glue fight!',
    'great for fixing up your ship, or your crew... errr wait, no, just the ship.',
  ],
  dremel: ['grind & polish, matey!'],
  backpack: [
    'now you can carry more doubloons!',
    'great for carrying all your loot!',
    'now you can carry more than just the one piece of eight!',
    'great for carrying all your booty... errr, I mean treasure!',
  ],
  oscilloscope: ['Chart the size of the waves, matey!', 'Amplitude ahoy!'],
  thermal_camera: [
    'now you can see in the heat of the moment!',
    "It's like having a spyglass for heat!",
  ],
  ticket_to_defcon: [
    'now you can go to the best pirate convention in the world!',
    "don't bring your doubloons– there thar be pickpockets!",
    "don't worry, they take doubloons at the door!",
    "but... i've heard it's cancelled this year...",
  ],
  framework_16: [
    'icon:freakingRaccoon|The dread ship Theseus!',
    'icon:scallywagRaccoon|Swap out the parts, just like me and my peg leg!',
    "icon:scallywagRaccoon|Swap out the parts, just like my first mate's hook!",
    'icon:scallywagRaccoon|Arrrr, this laptop be a fine vessel!',
    'icon:scallywagRaccoon|A fine piece of craftsmanship, this be! Only some of the parts are plundered.',
    `icon:scallywagRaccoon|I made me own framework once, with nothing but a handful of plundered parts lashed together using ${sample(salvagedItems)} and ${sample(salvagedItems)}!`,
    "icon:scallywagRaccoon|I heard they're made by Nirav himself!",
  ],
}

const shopTabIn = ['The pirate shop!', 'Legit pirate loot!', "Pirate's booty!"]
const shopTabOut = [
  "Arrr, where'd me loot go?",
  'Ye skurvy dog!',
  "I'll keelhaul!",
  "I'll make ye walk the plank!",
  'Arrr, ye scallywag!',
  "Blow me down sailor, where'd ya go!",
]
