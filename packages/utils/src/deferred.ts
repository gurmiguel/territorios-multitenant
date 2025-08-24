export class CanceledDeferredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CanceledDeferredError'
  }
}

export class Deferred<V = void> {
  resolve!: (value: V | PromiseLike<V>)=> void
  reject!: (reason?: unknown)=> void
  status: 'pending' | 'resolved' | 'rejected' = 'pending'

  private promise = this.createPromise()

  unwrap() {
    return this.promise
  }

  reset() {
    if (this.status === 'pending')
      this.reject(new CanceledDeferredError('Promise was reset'))
    this.status = 'pending'
    this.promise = this.createPromise()
  }

  private createPromise() {
    return new Promise<V>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
      .then(v => {
        this.status = 'resolved'
        return v
      })
      .catch(err => {
        this.status = 'rejected'
        throw err
      })
  }
}
