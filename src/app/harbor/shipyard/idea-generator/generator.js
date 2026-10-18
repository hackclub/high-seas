import { category_names, data } from './data.js'
// warning: terrible code ahead

let categories = {}
let recently_used = []
let character_is_group = false
let character_post_description = ''

export function init() {
  // Store list of entries by category name
  for (let i = 0; i < category_names.length; i++) {
    name = category_names[i]
    categories[name] = getCategory(name)
  }
}

export function generate() {
  reset()
  const template = pickRandom('template')
  const result = fillInTemplate(template)
  return formatOutput(result)
}

function reset() {
  character_post_description = ''
  recently_used.length = 0
  character_is_group = false
}

function fillInTemplate(template) {
  // @ symbol represents a generator. So '@character@', for example,
  // should be replaced with a call to the generateCharacter function
  if (template.includes('@')) {
    let command = getTextBetweenTags(template, '@', '@')
    let replacement = 'NO REPLACEMENT FOUND'
    let generator = command.split(':')[0]
    let parameters = []
    if (command.includes(':')) {
      parameters = command.split(':')[1].split(',')
    }

    switch (generator) {
      case 'character':
        replacement = generateCharacter(parameters)
        break
      case 'character_description':
        replacement = pickRandom('character_description')
        break
      case 'goal':
        replacement = generateGoal()
        break
      case 'genre':
        replacement = generateGenre(parameters)
        break
      case 'wildcard':
        replacement = generateWildcard(parameters)
        break
      case 'mood':
        replacement = generateMood()
        break
      case 'setting':
        replacement = generateSetting()
        break
      case 'setting_description':
        replacement = pickRandomOrNone('setting_description', 0.7)
        break
      case 'theme':
        replacement = generateTheme()
        break
      default:
        replacement = pickRandom(generator)
    }

    template = replaceTextBetweenTags(template, replacement, '@', '@')
    // recursively fill in all generators
    return fillInTemplate(template)
  }

  // replace <a> with appropriate indefinite article based on context
  if (template.includes('<')) {
    let first_word = template.substring(template.indexOf('>') + 2)
    let replacement = indefiniteArticle(first_word)
    template = replaceTextBetweenTags(template, replacement, '<', '>')
    // recursively fill in all commands
    return fillInTemplate(template)
  }

  // pick conjugation of verb based on character being singular or multiple. E.g. (is,are)
  if (template.includes('(')) {
    let options_list = getTextBetweenTags(template, '(', ')').split(',')
    let index = character_is_group ? 1 : 0
    let option = options_list[index].trim()

    template = replaceTextBetweenTags(template, option, '(', ')')
    return fillInTemplate(template)
  }

  return template
}

// ------------------------------------ GENERATORS ------------------------------------
// returns a random character name (+ chance of random description)
function generateCharacter(parameters) {
  // params:
  let allow_post_desc = !parameters.includes('nopost')
  let is_player = !parameters.includes('npc')

  let chance_of_group = 0.2
  let make_group = randomChance(chance_of_group)
  let pre_desc = pickRandomOrNone('character_description', 0.6)

  let post_desc_chance = allow_post_desc ? (pre_desc ? 0.25 : 0.8) : 0
  character_post_description = pickRandomOrNone('character_description_post', post_desc_chance)

  if (is_player) {
    character_is_group = make_group
  }

  if (make_group) {
    character_post_description = character_post_description
    return (
      '<a> ' +
      pickRandom('group_name') +
      ' of ' +
      pre_desc +
      ' ' +
      pluralize(pickRandom('character')) +
      ' ' +
      character_post_description +
      ' '
    )
  }

  let character = pickRandom('character')
  let result = '<a> ' + pre_desc + ' ' + character + ' ' + character_post_description

  return result
}

function generateGoal() {
  let prefix = pickRandom('goal_prefix')

  // Avoid awkward phrasing like: you play as a zombie who is addicted to brains who wants to leave the planet
  // Instead change to: you play as a zombie who is addicted to brains and wants to leave the planet
  if (character_post_description.includes('who') || character_post_description.includes('that')) {
    prefix = prefix.replace('who', 'and')
  }

  return prefix + ' ' + pickRandom('goal')
}

function generateGenre(parameters) {
  let use_modifers = !parameters.includes('nomods')
  if (use_modifers) {
    let perspective = pickRandomOrNone('perspective', 0.2)
    let genre_detail = pickRandomOrNone('genre_modifier', 0.25)
    let genre = pickRandomOrNone('genre', perspective ? 0.25 : 0.85)
    let result = perspective + ' ' + genre_detail + ' ' + genre
    return result
  }

  return pickRandom('genre')
}

function generateWildcard(parameters) {
  let alwaysInclude = parameters.includes('always')

  let wildcard = pickRandomOrNone('wildcard', alwaysInclude ? 1 : 0.4)
  if (wildcard != '') {
    wildcard = wildcard.trim() + ','
  }
  return wildcard
}

function generateTheme() {
  return pickRandom('theme')
}

function generateSetting() {
  return pickRandom('setting')
}

function generateMood() {
  return pickRandomOrNone('mood', 0.3)
}

// ------------------------------------ UTILITY ------------------------------------

// Returns list of lines between #category_name: and #end in the data file
function getCategory(category_name) {
  let start_tag = `#${category_name}:\n`
  let end_tag = '\n#end'
  return getTextBetweenTags(data, start_tag, end_tag).split('\n')
}

function pickRandomOrNone(category_name, probability_exists) {
  if (randomChance(probability_exists)) {
    return pickRandom(category_name)
  }
  return ''
}

// Replace comma-separated entries inside square brackets with random entry
function resolveOptions(text) {
  if (text.includes('[')) {
    let options = getTextBetweenTags(text, '[', ']')
    let option = pickRandomFromList(options.split(','))
    text = replaceTextBetweenTags(text, option, '[', ']')
    // recursively fill in all options
    return resolveOptions(text)
  }
  return text
}

function pickRandom(category_name) {
  let category = categories[category_name]
  let random_index = Math.floor(Math.random() * category.length)

  // Avoid duplicates:
  let max_iterations = 5
  for (let i = 0; i < max_iterations; i++) {
    var result = resolveOptions(category[random_index])
    if (recently_used.includes(result)) {
      random_index = (random_index + 1) % category.length
    } else {
      recently_used.push(result)
      break
    }
  }
  return result
}

function getTextBetweenTags(text, start_tag, end_tag) {
  return text.split(start_tag)[1].split(end_tag)[0]
}

// Note: must handle start and end tags being identical
function replaceTextBetweenTags(text, replacement, start_tag, end_tag) {
  let start_index = text.indexOf(start_tag)
  let end_index = start_index + text.substring(start_index + 1).indexOf(end_tag)
  return text.substring(0, start_index) + replacement + text.substring(end_index + 2)
}

function pickRandomFromList(list) {
  let random_index = Math.floor(Math.random() * list.length)
  return list[random_index]
}

function randomChance(probability) {
  return Math.random() < probability
}

// Returns indefinite article for given word.
// Exceptions will need to be added if words are added to the word list.
// TODO: Maybe replace with this?: http://home.nerbonne.org/A-vs-An/
function indefiniteArticle(word) {
  word = word.trim()

  // exceptions:
  if (word.startsWith('one') || word.startsWith('uni')) {
    return 'a'
  }

  //return 'an' if word starts with vowel, otherwise 'a'
  let vowels = 'aeiou'
  if (vowels.includes(word[0])) {
    return 'an'
  }

  return 'a'
}

// Plural rules for given word list. Will need to be expanded if new words are added.
// TODOD: Maybe replace with this?: https://github.com/blakeembrey/pluralize
function pluralize(word) {
  // exceptions:
  switch (word) {
    case 'goose':
      return 'geese'
    case 'fish':
      return 'fish'
    case 'human':
      return 'humans'
    case 'fish':
      return word
    case 'thief':
      return 'thieves'
    default:
      // general rules:
      if (word.substr(-2) == 'ey') {
        return word + 's'
      }
      if (word.substr(-1) == 'y') {
        return word.substring(0, word.length - 1) + 'ies'
      }
      if (word.substr(-1) == 'h') {
        return word + 'es'
      }
      if (word.substr(-3) == 'man') {
        return word.substring(0, word.length - 3) + 'men'
      }
      if (word.substr(-5) == 'child') {
        return word + 'ren'
      }

      return word + 's'
  }
}

function formatOutput(result) {
  result = result.trim()
  result = result.replace(/ +(?= )/g, '') // replace multiple spaces with single space
  result = result.replace(' -', '-') // remove accidental space between hyphenated words
  result = result.replace('- ', '-')
  result = result[0].toUpperCase() + result.substring(1, result.length) // capitalise first letter
  if (result.substr(-1) == ',') {
    result = result.substring(0, result.length - 1).trim()
  }
  result = result + '.'
  result = result.replace(' ,', ',')
  return result
}
