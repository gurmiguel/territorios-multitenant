import { fetchTerritories } from './territories.data'
import { TerritoryListItem } from './territory-list-item'
import { HeaderConfig } from '../header/context'

export async function TerritoriesPage() {
  const { territories } = await fetchTerritories()

  return (
    <div className="flex">
      <HeaderConfig title="Territórios" showMap />
      <ul className="flex-1">
        {territories.map(territory => (
          <TerritoryListItem key={territory.id}
            territory={territory} />
        ))}
        {/* TODO: implement territory add */}
      </ul>
    </div>
  )
}
