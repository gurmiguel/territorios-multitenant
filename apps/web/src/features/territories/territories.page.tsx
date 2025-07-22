import { fetchTerritories } from './territories.data'
import { TerritoryListItem } from './territory-list-item'

export async function TerritoriesPage() {
  const { territories } = await fetchTerritories()

  return (
    <div className="flex">
      <ul className="flex-1">
        {territories.map(territory => (
          <TerritoryListItem key={territory.id}
            territory={territory} />
        ))}
      </ul>
    </div>
  )
}
