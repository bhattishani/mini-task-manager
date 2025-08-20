'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  IconButton
} from '@mui/material'
import { Edit as EditIcon, PhotoCamera } from '@mui/icons-material'
import { updateAdminProfile } from '@/store/slices/authSlice'

export default function AdminProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: null as File | null
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }))
      if (user.profileImage) {
        setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${user.profileImage}`)
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
    setSuccess(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }))
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to set a new password')
        setLoading(false)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        setLoading(false)
        return
      }
    }

    try {
      const form = new FormData()

      form.append('name', formData.name)
      form.append('email', formData.email)

      if (formData.newPassword && formData.currentPassword) {
        form.append('currentPassword', formData.currentPassword)
        form.append('newPassword', formData.newPassword)
      }

      if (formData.profileImage instanceof File) {
        form.append('profileImage', formData.profileImage)
      }

      await dispatch(updateAdminProfile(form)).unwrap()
      setSuccess(true)

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profileImage: null
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h4' component='h1'>
            Edit Profile
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' sx={{ mb: 3 }}>
            Profile updated successfully
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={previewUrl || undefined} alt={formData.name} sx={{ width: 120, height: 120 }} />
                <IconButton
                  color='primary'
                  aria-label='upload picture'
                  component='label'
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PhotoCamera />
                  <input type='file' hidden accept='image/*' onChange={handleFileChange} />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField fullWidth label='Name' name='name' value={formData.name} onChange={handleChange} required />
              <TextField
                fullWidth
                type='email'
                label='Email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Change Password (Optional)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  type='password'
                  label='Current Password'
                  name='currentPassword'
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    fullWidth
                    type='password'
                    label='New Password'
                    name='newPassword'
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    type='password'
                    label='Confirm New Password'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  )
}
