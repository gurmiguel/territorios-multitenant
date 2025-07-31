export type Override<T, U> = Omit<T, keyof U> & U

export enum HouseTypes {
  Casa = 'Casa',
  Apartamento = 'Apartamento',
  Comercio = 'Comércio',
  Empresa = 'Empresa',
}
