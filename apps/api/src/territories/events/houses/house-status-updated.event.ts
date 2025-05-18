import { House, StatusUpdate, Territory } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class HouseStatusUpdatedEvent extends EventRecord<HouseStatusUpdatedEvent> implements EventData {
  public static readonly event = 'house.status.updated'

  public readonly territoryId!: Territory['id']
  public readonly houseId!: House['id']
  public readonly status!: StatusUpdate
}
