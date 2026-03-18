export enum Area {
  CONGREGATION = 'congregation',
  USERS = 'users',
  TERRITORIES = 'territories',
  STREETS = 'streets',
  HOUSES = 'houses',
  ASSETS = 'assets',
}

export const AreaLabels = new Map(Object.entries({
  [Area.CONGREGATION]: 'Congregação',
  [Area.USERS]: 'Usuários',
  [Area.TERRITORIES]: 'Territórios',
  [Area.STREETS]: 'Ruas',
  [Area.HOUSES]: 'Casas',
  [Area.ASSETS]: 'Imagens',
} satisfies Record<Area, string>))
