import { getMapUrl } from '~/features/map/map.data'
import { MapPage } from '~/features/map/map.page'

export default async function MapPageComponent() {
  const mapUrl = await getMapUrl()

  return <MapPage mapUrl={mapUrl} />
}
