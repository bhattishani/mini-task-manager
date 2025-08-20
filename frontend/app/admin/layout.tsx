'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'
import Loader from '@/components/ui/Loader'
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material'
import { Dashboard, People, Assignment, ArrowDropDown } from '@mui/icons-material'
import Link from 'next/link'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

const drawerWidth = 240

const navItems = [
  { text: 'Dashboard', href: '/admin/dashboard', icon: <Dashboard /> },
  { text: 'Users', href: '/admin/users', icon: <People /> },
  { text: 'Tasks', href: '/admin/tasks', icon: <Assignment /> }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [isMounted, setIsMounted] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (user?.role !== 'admin') {
        router.replace('/tasks')
      }
    }
  }, [router, user, isAuthenticated, isMounted])

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
    handleClose()
  }
  ModuleRegistry.registerModules([AllCommunityModule])

  if (!isMounted || !isAuthenticated) {
    return <Loader />
  }

  if (user?.role !== 'admin') {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant='h4'>Access Denied</Typography>
          <Typography>You do not have permission to view this page. Redirecting...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          bgcolor: '#232C65'
        }}
      >
        <Toolbar>
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <Tooltip title='Account settings'>
            <Box onClick={handleMenu} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar
                src={
                  user?.profileImage
                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${user.profileImage}`
                    : undefined
                }
                alt={user?.name}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
              <ArrowDropDown />
            </Box>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={open}
            onClose={handleClose}
            sx={{ mt: '45px' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant='subtitle1'>{user?.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {user?.email}
              </Typography>
            </Box>
            <MenuItem
              onClick={() => {
                handleClose()
                router.push('/admin/profile')
              }}
            >
              Edit Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map(item => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} href={item.href} selected={pathname === item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
