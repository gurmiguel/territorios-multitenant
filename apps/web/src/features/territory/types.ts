export interface Territory { id: number, number: string, imageUrl: string, streets: Street[] }
export interface Street { id: number, name: string, houses: House[] }
export interface House { id: number, type: string, number: string, complement: string, observation: string, phones: string[], updates?: StatusUpdate[] }
export interface StatusUpdate { id: string, date: string, status: string, userId: string }

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
  streetId: number
  house: House
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
