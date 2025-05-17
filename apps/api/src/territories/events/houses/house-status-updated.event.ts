import { House, StatusUpdate } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class HouseStatusUpdatedEvent extends EventRecord<HouseStatusUpdatedEvent> implements EventData {
  public static readonly event = 'house.status.updated'

  public readonly houseId!: House['id']
  public readonly status!: StatusUpdate
}
