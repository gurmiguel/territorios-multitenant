import { Street } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class StreetDeletedEvent extends EventRecord<StreetDeletedEvent> implements EventData {
  public static readonly event = 'street.deleted'

  public readonly id!: Street['id']
}
