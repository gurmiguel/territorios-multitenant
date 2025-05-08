export function delay(timeInMilliseconds?: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeInMilliseconds)
  })
}
