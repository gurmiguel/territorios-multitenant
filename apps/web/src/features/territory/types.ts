export interface Territory { id: string, number: string, imageUrl: string, streets: Street[] }
export interface Street { id: string, name: string, houses: House[] }
export interface House { id: number, type: string, number: string, complement: string, observation: string, phones: string[], updates?: StatusUpdate[] }
export interface StatusUpdate { id: string, date: string, status: string, userId: string }

export interface StreetCreatedEvent {
  territoryNumber: string
  street: Street
}

export interface HouseStatusUpdateEvent {
  houseId: number
  territoryNumber: string
  streetId: string
  status: StatusUpdate
}

export interface HouseCreatedEvent {
  territoryNumber: string
  streetId: string
  house: House
}

export interface HouseUpdatedEvent {
  territoryNumber: string
  streetId: string
  house: House
}

export interface HouseDeletedEvent {
  id: number
  territoryNumber: string
}
