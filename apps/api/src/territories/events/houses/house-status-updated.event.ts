import { House, StatusUpdate, Street, Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class HouseStatusUpdatedEvent extends EventRecord<HouseStatusUpdatedEvent> implements EventData {
  public static readonly event = 'house.status.updated'

  public readonly territoryId!: Territory['id']
  public readonly houseId!: House['id']
  public readonly streetId!: Street['id']
  public readonly territoryNumber!: Territory['number']
  public readonly status!: StatusUpdate
}
