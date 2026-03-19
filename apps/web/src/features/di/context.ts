import { AsyncLocalStorage } from 'async_hooks'

export const requestContext = new AsyncLocalStorage<Map<string, any>>()

export function withRequestScope<Args extends any[], T = unknown>(fn: (...args: Args)=> Promise<T>) {
  return async (...args: Args) => {
    const store = new Map<string, unknown>()
    return requestContext.run(store, () => {
      return fn(...args)
    })
  }
}
