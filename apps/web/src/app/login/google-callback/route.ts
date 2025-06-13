import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { ServerApiClient } from '~/features/api/api.server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const authResult = searchParams.get('auth_result')
  const code = searchParams.get('code')

  if (authResult !== 'success' || !code)
    redirect('/login')

  const { access_token, refresh_token } = await ServerApiClient.getInstance().fetch<Record<'access_token' | 'refresh_token', string>>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: code })
  })

  await ServerApiClient.getInstance().authenticate(access_token, refresh_token)

  redirect('/')
}
