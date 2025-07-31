import { QueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import { HouseDeletedEvent, HouseStatusUpdateEvent, HouseUpdatedEvent, Territory } from './types'
import { EventsHandler } from '../events/events.hooks'

export default class TerritoryEvents implements EventsHandler<TerritoryEvents> {
  constructor(
    protected readonly queryClient: QueryClient,
  ) {}

  // TODO: add missing event handlers

  ['house.status.updated'](data: HouseStatusUpdateEvent) {
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        const $house = territory?.streets
          .find(s => s.id === data.streetId)
          ?.houses.find(h => h.id === data.houseId)

        if ($house)
          $house.updates = [data.status]
      })),
    ] as const
  }

  ['house.updated'](data: HouseUpdatedEvent) {
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        const $street = territory?.streets
          .find(s => s.id === data.streetId)

        if (!$street) return

        const houseIndex = $street?.houses.findIndex(h => h.id === data.house.id)

        $street.houses[houseIndex] = {
          ...$street.houses[houseIndex],
          ...data.house,
        }
      })),
    ] as const
  }

  ['house.deleted'](data: HouseDeletedEvent) {
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        const $street = territory?.streets?.find(street => street.houses.some(h => h.id === data.id))

        if ($street)
          $street.houses.splice($street.houses.findIndex(house => house.id === data.id), 1)
      })),
    ] as const
  }
}
