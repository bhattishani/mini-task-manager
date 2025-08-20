'use client'
import { createTheme } from '@mui/material/styles'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap'
})

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6'
    },
    secondary: {
      main: '#19857b'
    },
    background: {
      default: '#f4f6f8'
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
})

export default theme
