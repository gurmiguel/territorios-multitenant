export function capitalize(string: string) {
  const [first, ...rest] = string.split('')

  return first?.toUpperCase() + rest.join('')
}
