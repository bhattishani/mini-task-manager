'use client'

import { Container, Box, Typography, Grid, Link as MuiLink, Paper } from '@mui/material'
import Link from 'next/link'
import SignupForm from '@/components/forms/SignupForm'

export default function SignupPage() {
  return (
    <Grid container component='main' sx={{ height: '100vh' }}>
      <Grid
        size={{ xs: false, sm: 4, md: 7 }}
        sx={{
          backgroundImage: 'url(https://placehold.co/1200x900/232C65/FFFFFF?text=Join+Us)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: t => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <Grid
        size={{ xs: 12, sm: 8, md: 5 }}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Container component='main' maxWidth='xs'>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography component='h1' variant='h4' sx={{ color: '#232C65', fontWeight: 'bold' }}>
              Create Your Account
            </Typography>
            <Typography component='p' color='text.secondary' sx={{ mb: 3 }}>
              Get started by filling out the form below
            </Typography>
            <SignupForm />
            <Grid container justifyContent='flex-end'>
              <Grid>
                <MuiLink component={Link} href='/login' variant='body2'>
                  Already have an account? Sign in
                </MuiLink>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Grid>
    </Grid>
  )
}
