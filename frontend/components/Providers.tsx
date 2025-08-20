'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import theme from '../theme/theme'
import StoreProvider from './StoreProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <StoreProvider>{children}</StoreProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
