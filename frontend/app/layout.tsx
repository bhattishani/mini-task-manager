import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import Providers from '../components/Providers'

export const metadata: Metadata = {
  title: 'Mini Task Manager',
  description: 'A simple task management application'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <AppRouterCacheProvider>
          <Providers>
            {children}
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
