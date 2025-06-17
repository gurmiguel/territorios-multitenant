import { sortBy } from 'lodash'

interface House {
  type: string;
  number: string;
  complement: string;
}

export function formatHouseNumber({ type, number, complement }: House) {
  const builder = new Array<string>()

  builder.push(number.padStart(2, '0'))

  switch (type) {
    case 'Casa':
      if (Number.isNaN(Number(complement)) && complement.toUpperCase() !== 'FUNDOS')
        builder.push(`Casa ${complement}`)
      else
        builder.push(complement)
      break
    case 'Apartamento':
      if (!complement.toUpperCase().includes('AP'))
        builder.push(`AP ${complement}`)
      else
        builder.push(complement)
      break
    default:
      builder.push(type)
      if (complement) builder.push(complement)
  }

  return builder.join(' ')
}

export function sortHouses<T extends House>(houses: T[]): T[] {
  return sortBy(houses, house => formatHouseNumber(house))
}
