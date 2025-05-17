import { Territory } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class TerritoryUpdatedEvent extends EventRecord<TerritoryUpdatedEvent> implements EventData {
  public static readonly event = 'territory.updated'

  public readonly territory!: Territory
}
