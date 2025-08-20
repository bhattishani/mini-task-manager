'use client'
import { useState } from 'react'
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuItem, Avatar, Divider } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { logout } from '@/store/slices/authSlice'
import { enqueueSnackbar } from 'notistack'

export default function Header() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    router.push('/profile')
    handleClose()
  }

  const handleLogout = () => {
    dispatch(logout())
    handleClose()
    enqueueSnackbar('Logout successful!', { variant: 'success' })
    router.push('/login')
  }

  return (
    <AppBar position='static' sx={{ bgcolor: '#232C65' }}>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Mini Task Manager
        </Typography>
        {user && (
          <div>
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleMenu}
              color='inherit'
            >
              <Avatar
                alt={user.name}
                src={
                  user.profileImage
                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${user.profileImage}`
                    : undefined
                }
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id='menu-appbar'
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant='subtitle1'>{user.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  )
}
