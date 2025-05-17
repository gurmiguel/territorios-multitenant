import { fromEvent, Observable } from 'rxjs'
import { NodeCompatibleEventEmitter } from 'rxjs/internal/observable/fromEvent'

import { RecordClass } from './record'

export interface EventData {
  event: string
}

export abstract class EventRecord<T> extends RecordClass<EventRecord<T>, 'event'> implements EventData {
  /**
   * Should be overriden by concrete class, workaround for static abstract properties
   * @deprecated */
  public static readonly event: unknown

  get event() {
    return (this.constructor as any).event
  }
}

type Constructor<T> = new(...args: any[])=> T
export function fromTypedEvent<T extends EventData>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string, resultSelector: (...args: any[])=> T): Observable<T>
export function fromTypedEvent<T extends EventData>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventClass: Constructor<T> & { event: string }): Observable<T>
export function fromTypedEvent<T extends EventData>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<T>
export function fromTypedEvent<T extends EventData>(
  target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>,
  eventClassOrName: Constructor<T> & { event: string } | string,
  resultSelector?: (...args: any[])=> T,
) {
  const eventName = typeof eventClassOrName === 'string' ? eventClassOrName : eventClassOrName.event

  let result: Observable<unknown>
  if (typeof resultSelector === 'undefined')
    result = fromEvent(target, eventName)
  else
    result = fromEvent(target, eventName, resultSelector)

  return result as Observable<T>
}
