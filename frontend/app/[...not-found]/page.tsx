'use client'

import { Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant='h1' component='h1' gutterBottom sx={{ color: '#232C65', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant='h5' component='h2' gutterBottom>
          Page Not Found
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 4 }}>
          Sorry, we couldn’t find the page you’re looking for.
        </Typography>
        <Button
          component={Link}
          href='/'
          variant='contained'
          sx={{ bgcolor: '#232C65', '&:hover': { bgcolor: '#1a204d' } }}
        >
          Go back home
        </Button>
      </Box>
    </Container>
  )
}
