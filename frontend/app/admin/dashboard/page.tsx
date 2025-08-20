'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { fetchDashboardStats } from '@/store/slices/admin/dashboardSlice'
import { Container, Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material'
import { BarChart as BarChartIcon, People, Assignment, CheckCircle, Timeline } from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { stats, loading, error } = useSelector((state: RootState) => state.admin.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>
  }

  if (!stats) {
    return null
  }
  const { overview, charts } = stats

  if (!overview || !charts) {
    return <Alert severity='info'>No data available</Alert>
  }

  const overviewCards = [
    { title: 'Total Users', value: overview?.totalUsers || 0, icon: <People fontSize='large' color='primary' /> },
    { title: 'Total Tasks', value: overview?.totalTasks || 0, icon: <Assignment fontSize='large' color='primary' /> },
    {
      title: 'Completed Tasks',
      value: overview?.completedTasks || 0,
      icon: <CheckCircle fontSize='large' color='success' />
    },
    {
      title: 'Completion Rate',
      value: `${(overview?.completionRate ?? 0).toFixed(1)}%`,
      icon: <Timeline fontSize='large' color='info' />
    }
  ]

  const taskTrendData = charts.tasksByDay.map(item => ({
    date: item._id,
    tasks: item.count
  }))

  const statusData = charts.tasksByStatus.map(item => ({
    name: item._id,
    value: item.count
  }))

  const userRegData = charts.userRegistrations.map(item => ({
    date: item._id,
    users: item.count
  }))

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#232C65' }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        {overviewCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color='text.secondary'>{stat.title}</Typography>
                <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </Box>
              {stat.icon}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Task Creation Trend
            </Typography>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={taskTrendData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Line type='monotone' dataKey='tasks' stroke='#8884d8' name='Tasks' />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Task Status Distribution
            </Typography>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={80} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              User Registration Trend
            </Typography>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={userRegData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Line type='monotone' dataKey='users' stroke='#82ca9d' name='New Users' />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
