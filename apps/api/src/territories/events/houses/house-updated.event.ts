import { House } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class HouseUpdatedEvent extends EventRecord<HouseUpdatedEvent> implements EventData {
  public static readonly event = 'house.updated'

  public readonly house!: House
}
