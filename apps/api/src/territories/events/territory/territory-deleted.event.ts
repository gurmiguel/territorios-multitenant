import { Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class TerritoryDeletedEvent extends EventRecord<TerritoryDeletedEvent> implements EventData {
  public static readonly event = 'territory.deleted'

  public readonly id!: Territory['id']
  public readonly territoryNumber!: Territory['number']
}
