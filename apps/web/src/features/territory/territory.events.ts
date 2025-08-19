import { QueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import { HouseCreatedEvent, HouseDeletedEvent, HouseStatusUpdateEvent, HouseUpdatedEvent, StreetCreatedEvent, StreetDeletedEvent, Territory, TerritoryCreatedEvent } from './types'
import { EventsHandler } from '../events/events.hooks'

export default class TerritoryEvents implements EventsHandler<TerritoryEvents> {
  constructor(
    protected readonly queryClient: QueryClient,
    protected readonly offlineOnly = false,
  ) {}

  // TODO: add missing event handlers

  ['territory.created'](data: TerritoryCreatedEvent) {
    if (!this.shouldUpdate()) return null
    return [
      'territories',
      this.queryClient.setQueryData<{items: Territory[]}>(['territories'], produce(response => {
        if (!response) return
        response.items.push(data.territory)
        response.items.sort((a, b) => Number(a.number) - Number(b.number))
      })),
    ] as const
  }

  ['street.deleted'](data: StreetDeletedEvent) {
    if (!this.shouldUpdate()) return null
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        const index = territory?.streets.findIndex(s => s.id === data.id) ?? -1

        if (index === -1) return

        territory?.streets.splice(index, 1)
      })),
    ] as const
  }

  ['street.created'](data: StreetCreatedEvent) {
    if (!this.shouldUpdate()) return null
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        if (territory?.streets.some(s => s.id === data.street.id)) return

        territory?.streets.push(data.street)
      })),
    ] as const
  }

  ['house.status.updated'](data: HouseStatusUpdateEvent) {
    if (!this.shouldUpdate()) return null
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

  ['house.created'](data: HouseCreatedEvent) {
    if (!this.shouldUpdate()) return null
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        const $street = territory?.streets.find(s => s.id === data.streetId)

        if (!$street) return

        $street.houses.push(data.house)
      })),
    ] as const
  }

  ['house.updated'](data: HouseUpdatedEvent) {
    if (!this.shouldUpdate()) return null
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
    if (!this.shouldUpdate()) return null
    return [
      `territories/${data.territoryNumber}`,
      this.queryClient.setQueryData<Territory>(['territories', data.territoryNumber], produce(territory => {
        const $street = territory?.streets?.find(street => street.houses.some(h => h.id === data.id))

        if (!$street) return

        const index = $street.houses.findIndex(house => house.id === data.id)

        if (index === -1) return

        $street.houses.splice(index, 1)
      })),
    ] as const
  }

  private shouldUpdate() {
    return !this.offlineOnly || navigator.onLine
  }
}
