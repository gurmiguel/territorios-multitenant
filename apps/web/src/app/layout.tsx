import './globals.css'

import { Toaster } from '@repo/ui/components/ui/sonner'
import { Metadata } from 'next'

import ZodProvider from '~/features/adapters/zod-provider'
import { QueryProvider } from '~/features/api/query-provider'
import { DummyAwaiter } from '~/features/api/utils'
import { AuthProvider } from '~/features/auth/auth.context'
import { getCongregationData } from '~/features/congregation/congregation.data'
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
      <head/>
      <body>
        <DummyAwaiter />
        <ThemeProvider>
          <AuthProvider>
            <ZodProvider>
              <QueryProvider>
                <HeaderProvider>
                  <Header />
                  <main className="flex flex-col flex-1 container-fluid">
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
  const congregation = await getCongregationData()

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
