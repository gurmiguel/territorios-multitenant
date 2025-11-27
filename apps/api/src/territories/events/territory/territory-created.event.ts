import { Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class TerritoryCreatedEvent extends EventRecord<TerritoryCreatedEvent> implements EventData {
  static event = 'territory.created'

  public readonly territory!: Territory
}
