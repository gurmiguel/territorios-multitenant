import { Street, Territory } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class StreetUpdatedEvent extends EventRecord<StreetUpdatedEvent> implements EventData {
  public static readonly event = 'street.updated'

  public readonly street!: Street
  public readonly territoryNumber!: Territory['number']
}
