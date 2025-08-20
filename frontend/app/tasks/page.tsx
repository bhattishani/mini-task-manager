'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Modal,
  Paper,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Add, Close, Logout, Refresh, Delete, InboxOutlined } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useDebounce } from 'use-debounce'
import { AppDispatch, RootState } from '@/store/store'
import { fetchTasks, createTask, updateTask, deleteTask, deleteMultipleTasks } from '@/store/slices/taskSlice'
import { fetchUsers } from '@/store/slices/admin/userSlice'
import { logout } from '@/store/slices/authSlice'
import TaskCard from '@/components/TaskCard'
import { Task } from '@/types/task'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import TaskView from '@/components/TaskView'

const TaskForm = dynamic(() => import('@/components/forms/TaskForm'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  )
})

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 700 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto'
}

export default function TasksPageClient() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks)
  const { users: allUsers } = useSelector((state: RootState) => state.admin.users)
  const { enqueueSnackbar } = useSnackbar()

  const [isFormModalOpen, setFormModalOpen] = useState(false)
  const [isViewModalOpen, setViewModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [userFilter, setUserFilter] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers())
    }
  }, [dispatch, isAdmin])

  const loadTasks = () => {
    const startDate = dateRange.start ? dateRange.start.toISOString().split('T')[0] : null
    const endDate = dateRange.end ? dateRange.end.toISOString().split('T')[0] : null
    dispatch(
      fetchTasks({
        status: statusFilter,
        search: debouncedSearchTerm,
        startDate,
        endDate,
        userId: userFilter === 'all' ? null : userFilter
      })
    )
  }

  useEffect(() => {
    loadTasks()
  }, [dispatch, statusFilter, debouncedSearchTerm, dateRange, userFilter])

  const handleSelectTask = (id: string) => {
    setSelectedTasks(prev => (prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]))
  }

  const handleOpenFormModal = (task: Task | null = null) => {
    setEditingTask(task)
    setFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    setFormModalOpen(false)
    setEditingTask(null)
  }

  const handleOpenViewModal = (task: Task) => {
    setViewingTask(task)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setViewingTask(null)
  }

  const handleFormSubmit = async (values: any, { resetForm }: any) => {
    setIsSubmitting(true)
    const action = editingTask ? updateTask({ ...editingTask, ...values }) : createTask(values)
    const successMessage = editingTask ? 'Task updated successfully!' : 'Task created successfully!'

    try {
      await dispatch(action).unwrap()
      enqueueSnackbar(successMessage, { variant: 'success' })
      resetForm()
      handleCloseFormModal()
      loadTasks()
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to save task', {
        variant: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openConfirmationDialog = (title: string, description: string, onConfirm: () => void) => {
    setDialogConfig({ title, description, onConfirm })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    openConfirmationDialog('Delete Task', 'This action cannot be undone.', async () => {
      try {
        await dispatch(deleteTask(id)).unwrap()
        enqueueSnackbar('Task deleted successfully!', { variant: 'success' })
      } catch (err: any) {
        enqueueSnackbar(err.message || 'Failed to delete task', {
          variant: 'error'
        })
      } finally {
        setDialogOpen(false)
      }
    })
  }

  const handleDeleteSelected = () => {
    openConfirmationDialog(`Delete ${selectedTasks.length} Tasks`, 'This action cannot be undone.', async () => {
      try {
        await dispatch(deleteMultipleTasks(selectedTasks)).unwrap()
        enqueueSnackbar('Selected tasks deleted successfully!', {
          variant: 'success'
        })
        setSelectedTasks([])
      } catch (err: any) {
        enqueueSnackbar(err.message || 'Failed to delete tasks', {
          variant: 'error'
        })
      } finally {
        setDialogOpen(false)
      }
    })
  }

  const handleUpdateStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const title = newStatus === 'completed' ? 'Mark as Complete' : 'Mark as Pending'
    const description = `Are you sure you want to mark this task as ${newStatus}?`

    openConfirmationDialog(title, description, async () => {
      const updatedTask = { ...task, status: newStatus }
      if (newStatus === 'completed') {
        updatedTask.completedAt = new Date().toISOString()
      } else {
        updatedTask.completedAt = null
      }

      try {
        await dispatch(updateTask(updatedTask as Task)).unwrap()
        enqueueSnackbar(`Task marked as ${newStatus}`, { variant: 'success' })
      } catch (err: any) {
        enqueueSnackbar(err.message || 'Failed to update task status', {
          variant: 'error'
        })
      } finally {
        setDialogOpen(false)
      }
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold', color: '#232C65' }}>
            {isAdmin ? 'All Tasks' : 'My Tasks'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => handleOpenFormModal()}
              sx={{ bgcolor: '#232C65', '&:hover': { bgcolor: '#1a204d' } }}
            >
              New Task
            </Button>
          </Box>
        </Box>

        <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid size={{ xs: 12, md: isAdmin ? 4 : 5 }}>
              <TextField
                fullWidth
                variant='outlined'
                label='Search tasks...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Grid>
            {isAdmin && (
              <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel>User</InputLabel>
                  <Select value={userFilter} onChange={e => setUserFilter(e.target.value)} label='User'>
                    <MenuItem value='all'>All Users</MenuItem>
                    {allUsers.map(user => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth variant='outlined'>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label='Status'>
                  <MenuItem value='all'>All</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='completed'>Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: isAdmin ? 2 : 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DatePicker
                  label='Start Date'
                  value={dateRange.start}
                  onChange={newValue => setDateRange(prev => ({ ...prev, start: newValue }))}
                  sx={{ width: '100%' }}
                />
                <DatePicker
                  label='End Date'
                  value={dateRange.end}
                  onChange={newValue => setDateRange(prev => ({ ...prev, end: newValue }))}
                  sx={{ width: '100%' }}
                  minDate={dateRange.start || undefined}
                />
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Tooltip title='Reload Tasks'>
              <IconButton onClick={loadTasks}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {selectedTasks.length > 0 && (
              <Button variant='outlined' color='error' startIcon={<Delete />} onClick={handleDeleteSelected}>
                Delete ({selectedTasks.length})
              </Button>
            )}
          </Box>
        </Paper>

        {loading === 'pending' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity='error'>{error}</Alert>}
        {loading === 'succeeded' && (
          <>
            {tasks.length > 0 ? (
              <Grid container spacing={3}>
                {tasks.map(task => (
                  <Grid key={task._id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <TaskCard
                      task={task}
                      isSelected={selectedTasks.includes(task._id)}
                      onSelect={handleSelectTask}
                      onView={handleOpenViewModal}
                      onEdit={handleOpenFormModal}
                      onDelete={() => handleDelete(task._id)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 8,
                  color: 'text.secondary'
                }}
              >
                <InboxOutlined sx={{ fontSize: 60 }} />
                <Typography variant='h6'>No tasks found</Typography>
                <Typography>Try adjusting your filters or create a new task.</Typography>
              </Box>
            )}
          </>
        )}

        <Modal open={isFormModalOpen} onClose={handleCloseFormModal}>
          <Paper sx={modalStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant='h6' component='h2'>
                {editingTask ? 'Edit Task' : 'New Task'}
              </Typography>
              <IconButton onClick={handleCloseFormModal}>
                <Close />
              </IconButton>
            </Box>
            {isFormModalOpen && (
              <TaskForm
                task={editingTask}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseFormModal}
                isSubmitting={isSubmitting}
              />
            )}
          </Paper>
        </Modal>

        <Modal open={isViewModalOpen} onClose={handleCloseViewModal}>
          <Paper sx={modalStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant='h6' component='h2'>
                Task Details
              </Typography>
              <IconButton onClick={handleCloseViewModal}>
                <Close />
              </IconButton>
            </Box>
            {viewingTask && <TaskView task={viewingTask} />}
          </Paper>
        </Modal>

        {dialogConfig && (
          <ConfirmationDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onConfirm={dialogConfig.onConfirm}
            title={dialogConfig.title}
            description={dialogConfig.description}
          />
        )}
      </Container>
    </LocalizationProvider>
  )
}
