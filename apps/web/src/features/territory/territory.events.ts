import { QueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import { HouseDeletedEvent, HouseUpdateEvent, Territory } from './types'
import { EventsHandler } from '../events/events.hooks'

export default class TerritoryEvents implements EventsHandler<TerritoryEvents> {
  constructor(
    protected readonly queryClient: QueryClient,
  ) {}

  // TODO: add missing event handlers

  ['house.status.updated'](data: HouseUpdateEvent) {
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
