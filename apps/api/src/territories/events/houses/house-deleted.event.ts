import { House } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class HouseDeletedEvent extends EventRecord<HouseDeletedEvent> implements EventData {
  public static readonly event = 'house.deleted'

  public readonly id!: House['id']
}
