import { Street, Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class StreetDeletedEvent extends EventRecord<StreetDeletedEvent> implements EventData {
  public static readonly event = 'street.deleted'

  public readonly id!: Street['id']
  public readonly territoryNumber!: Territory['number']
}
