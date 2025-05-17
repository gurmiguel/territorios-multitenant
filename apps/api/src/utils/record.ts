export abstract class RecordClass<T extends RecordClass<T>, Ex extends void | keyof T = void> {
  constructor(data: Ex extends keyof T ? Omit<T, Ex> : T) {
    Object.assign(this, data)
  }
}
