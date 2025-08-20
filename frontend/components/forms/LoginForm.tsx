'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material'
import { useSnackbar } from 'notistack'
import { loginUser } from '@/store/slices/authSlice'
import { AppDispatch, RootState } from '@/store/store'

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required')
})

export default function LoginForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { enqueueSnackbar } = useSnackbar()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard')
      }
      if (user?.role === 'user') {
        router.replace('/tasks')
      }
    }
  }, [dispatch, user, isAuthenticated])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setError(null)
      try {
        const response = await dispatch(loginUser(values)).unwrap()
        enqueueSnackbar('Login successful!', { variant: 'success' })
        if (response.user.role === 'admin') {
          router.replace('/admin/dashboard')
        } else {
          router.replace('/tasks')
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to login. Please check your credentials.'
        setError(errorMessage)
        enqueueSnackbar(errorMessage, { variant: 'error' })

        if (err.errors) {
          Object.keys(err.errors).forEach(key => {
            setFieldError(key, err.errors[key])
          })
        }
        setSubmitting(false)
      }
    }
  })

  return (
    <Box component='form' onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        margin='normal'
        fullWidth
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        margin='normal'
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <Button
        type='submit'
        fullWidth
        variant='contained'
        disabled={formik.isSubmitting}
        sx={{
          mt: 3,
          mb: 2,
          bgcolor: '#232C65',
          '&:hover': { bgcolor: '#1a204d' }
        }}
      >
        {formik.isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Sign In'}
      </Button>
    </Box>
  )
}
