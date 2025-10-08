import './globals.css'

import { Toaster } from '@repo/ui/components/ui/sonner'

import ZodProvider from '~/features/adapters/zod-provider'
import { QueryProvider } from '~/features/api/query-provider'
import { getTenant } from '~/features/api/utils.server'
import { AuthProvider } from '~/features/auth/auth.context'
import { HeaderProvider } from '~/features/header/context'
import { Header } from '~/features/header/header'
import { ThemeProvider } from '~/features/theme/theme.provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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

export async function generateMetadata() {
  const response = await fetch('http://localhost:3333/congregations', {
    headers: {
      'X-Tenant-Id': process.env.NODE_ENV === 'production' ? await getTenant() : 'alemanha',
    },
  })
  const data = await response.json()

  const title = `Congregação ${data.name}`

  return {
    title: {
      template: `%s | ${title}`,
      default: `${title}`,
    },
  }
}
