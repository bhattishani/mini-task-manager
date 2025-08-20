'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, TextField, Button, CircularProgress, Alert, Avatar, Typography } from '@mui/material'
import { PhotoCamera } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { signupUser } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store/store'
import { setToken, setUser } from '@/lib/auth'

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Confirm Password is required'),
  profileImage: Yup.mixed()
    .nullable()
    .test(
      'fileSize',
      'File too large, max 2MB',
      (value: any) => !value || (value && value.size <= 2 * 1024 * 1024) // 2MB
    )
    .test(
      'fileType',
      'Unsupported file format',
      (value: any) => !value || (value && ['image/jpeg', 'image/png', 'image/gif'].includes(value.type))
    )
})

export default function SignupForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { enqueueSnackbar } = useSnackbar()
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profileImage: null
    },
    validationSchema: SignupSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setError(null)
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)
      formData.append('password', values.password)
      formData.append('confirmPassword', values.confirmPassword)
      if (values.profileImage) {
        formData.append('profileImage', values.profileImage)
      }
      setSubmitting(true)
      const resultAction = await dispatch(signupUser(formData))
      if (signupUser.fulfilled.match(resultAction)) {
        enqueueSnackbar('Signup successful! redirecting...', { variant: 'success' })
        setUser(resultAction.payload.user)
        setToken(resultAction.payload.token)
        router.push('/tasks')
      } else {
        enqueueSnackbar(resultAction.payload || 'Signup failed. Please try again.', {
          variant: 'error'
        })
      }
    }
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (file) {
      formik.setFieldValue('profileImage', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      formik.setFieldValue('profileImage', null)
      setImagePreview(null)
    }
  }

  return (
    <Box component='form' onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Avatar src={imagePreview || undefined} sx={{ width: 80, height: 80, mb: 1 }} />
        <Button variant='outlined' component='label' startIcon={<PhotoCamera />}>
          Upload Image
          <input type='file' hidden accept='image/*' onChange={handleImageChange} />
        </Button>
        {formik.touched.profileImage && formik.errors.profileImage && (
          <Typography color='error' variant='caption' sx={{ mt: 1 }}>
            {formik.errors.profileImage}
          </Typography>
        )}
      </Box>

      <TextField
        margin='normal'
        fullWidth
        id='name'
        label='Name'
        name='name'
        autoComplete='name'
        autoFocus
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
      />
      <TextField
        margin='normal'
        fullWidth
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
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
        autoComplete='new-password'
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <TextField
        margin='normal'
        fullWidth
        name='confirmPassword'
        label='Confirm Password'
        type='password'
        id='confirmPassword'
        autoComplete='new-password'
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
        {formik.isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Sign Up'}
      </Button>
    </Box>
  )
}
