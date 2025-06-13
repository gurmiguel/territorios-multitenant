export async function getMapUrl() {
  const response = await fetch('http://localhost:3333/congregations', {
    headers: {
      'X-Tenant-Id': process.env.NODE_ENV === 'production' ? window.location.host : 'alemanha',
    },
  })
  const data = await response.json()
  const mapUrl = data.map?.publicUrl

  return mapUrl
}
