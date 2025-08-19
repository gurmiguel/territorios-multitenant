export function generateHexColor(seed: number) {
  return '#' + Math.floor(Math.abs(Math.sin(seed) * 16777215)).toString(16)
}
