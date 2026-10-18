// pluralize(1, 'apple') => '1 apple'
// pluralize(2, 'apple') => '2 apples'
// pluralize(2, 'apple', false) => 'apples'

export default function pluralize(count, singular, includeCount = true) {
  return (includeCount ? `${count} ` : '') + (count === 1 ? singular : singular + 's')
}
