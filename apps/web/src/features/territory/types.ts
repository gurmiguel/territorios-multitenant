export interface Congregation { id: number, name: string, slug: string, createdAt: Date, map?: { id: string, publicUrl: string } }
export interface Territory { id: number, number: string, color: string, hidden: boolean, imageUrl: string | null, streets: Street[], map: string | null }
export interface TerritoryListItem extends Omit<Territory, 'street'> { pendingHouses: number }
export interface Street { id: number, name: string, houses: House[] }
export interface House { id: number, type: string, number: string, complement: string, observation: string, phones: string[], updates?: StatusUpdate[] }
export interface StatusUpdate { id: string, date: string, status: string, userId: string }

export interface TerritoryCreatedEvent {
  territory: Territory
}

export interface TerritoryUpdatedEvent {
  territoryId: number
  territoryNumber: string
  territory: Partial<Territory>
}

export interface TerritoryDeletedEvent {
  territoryId: number
}

export interface StreetDeletedEvent {
  id: number
  territoryNumber: string
}

export interface StreetCreatedEvent {
  territoryNumber: string
  street: Street
}

export interface HouseStatusUpdateEvent {
  houseId: number
  territoryNumber: string
  streetId: number
  status: StatusUpdate
}

export interface HouseCreatedEvent {
  territoryNumber: string
  house: House & { streetId: number}
}

export interface HouseUpdatedEvent {
  territoryNumber: string
  streetId: number
  house: House
}

export interface HouseDeletedEvent {
  id: number
  territoryNumber: string
}
