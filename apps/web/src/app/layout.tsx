import './globals.css'

import { Header } from '@repo/ui/components/header'
import { headers } from 'next/headers'

import { QueryProvider } from '~/features/api/query-provider'
import { ThemeProvider } from '~/features/theme/theme.provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Header />
        <ThemeProvider>
          <QueryProvider>
            <main className="flex flex-col flex-1 container">
              {children}
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export async function generateMetadata() {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''

  const response = await fetch('http://localhost:3333/congregations', {
    headers: {
      'X-Tenant-Id': process.env.NODE_ENV === 'production' ? host : 'alemanha',
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
