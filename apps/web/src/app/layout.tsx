import './globals.css'

import { Toaster } from '@repo/ui/components/ui/sonner'
import { Metadata } from 'next'

import ZodProvider from '~/features/adapters/zod-provider'
import { ServerApiClient } from '~/features/api/api.server'
import { QueryProvider } from '~/features/api/query-provider'
import { getTenant } from '~/features/api/utils.server'
import { AuthProvider } from '~/features/auth/auth.context'
import { HeaderProvider } from '~/features/header/context'
import { Header } from '~/features/header/header'
import { Congregation } from '~/features/territory/types'
import { ThemeProvider } from '~/features/theme/theme.provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head/>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ZodProvider>
              <QueryProvider>
                <HeaderProvider>
                  <Header />
                  <main className="flex flex-col flex-1 container">
                    {children}
                  </main>
                </HeaderProvider>
              </QueryProvider>
              <Toaster position="bottom-center" closeButton={true} richColors />
            </ZodProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const congregation = await ServerApiClient.getInstance().query<Congregation>('/congregations', {
    headers: { 'x-tenant-host': await getTenant() },
    credentials: 'omit',
  })

  const title = `Congregação ${congregation.name}`

  return {
    title: {
      template: `%s | ${title}`,
      default: `${title}`,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: `Territórios ${congregation.name}`,
    },
    manifest: '/manifest.webmanifest',
  }
}
