import { Street, Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class StreetCreatedEvent extends EventRecord<StreetCreatedEvent> implements EventData {
  public static readonly event = 'street.created'

  public readonly street!: Street
  public readonly territoryNumber!: Territory['number']
}
