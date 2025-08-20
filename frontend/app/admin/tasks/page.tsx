'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { fetchTasks, deleteMultipleTasks, deleteTask, createTask, updateTask } from '@/store/slices/admin/taskSlice'
import { fetchUsers } from '@/store/slices/admin/userSlice'
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  IconButton,
  Modal,
  Avatar
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ICellRendererParams,
  PaginationChangedEvent,
  SortChangedEvent
} from 'ag-grid-community'
import { Add, Delete, Edit, Visibility, Close } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { Task } from '@/types/task'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import TaskView from '@/components/TaskView'
import TaskForm from '@/components/forms/TaskForm'

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

export default function AdminTasksPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { enqueueSnackbar } = useSnackbar()
  const { tasks, loading, error } = useSelector((state: RootState) => state.admin.tasks)
  const { users } = useSelector((state: RootState) => state.admin.users)

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [isFormModalOpen, setFormModalOpen] = useState(false)
  const [isViewModalOpen, setViewModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)
  const [gridApi, setGridApi] = useState<GridApi<Task> | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchTasks({ page, pageSize, sortField, sortOrder }))
  }, [dispatch, page, pageSize, sortField, sortOrder])

  const onGridReady = useCallback((params: GridReadyEvent<Task>) => {
    setGridApi(params.api)
  }, [])

  const handlePaginationChanged = useCallback(
    (event: PaginationChangedEvent) => {
      if (event.api) {
        const currentPage = event.api.paginationGetCurrentPage()
        const newPageSize = event.api.paginationGetPageSize()
        if (currentPage !== page || newPageSize !== pageSize) {
          setPage(currentPage)
          setPageSize(newPageSize)
        }
      }
    },
    [page, pageSize]
  )

  const handleSortChanged = useCallback((event: SortChangedEvent) => {
    const columnState = event.api.getColumnState()
    const sortedColumn = columnState.find(col => col.sort)
    if (sortedColumn) {
      setSortField(sortedColumn.colId)
      setSortOrder(sortedColumn.sort as 'asc' | 'desc')
    } else {
      setSortField('createdAt')
      setSortOrder('desc')
    }
  }, [])

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

  const openConfirmationDialog = (title: string, description: string, onConfirm: () => void) => {
    setDialogConfig({ title, description, onConfirm })
    setDialogOpen(true)
  }

  const refreshGrid = () => {
    if (gridApi) {
      dispatch(fetchTasks({ page, pageSize, sortField, sortOrder }))
    }
  }

  const handleDelete = (id: string) => {
    openConfirmationDialog(
      'Delete Task',
      'Are you sure you want to delete this task? This cannot be undone.',
      async () => {
        try {
          await dispatch(deleteTask(id)).unwrap()
          enqueueSnackbar('Task deleted successfully!', { variant: 'success' })
          refreshGrid()
        } catch (err: any) {
          enqueueSnackbar(err.message || 'Failed to delete task', {
            variant: 'error'
          })
        } finally {
          setDialogOpen(false)
        }
      }
    )
  }

  const handleDeleteSelected = () => {
    openConfirmationDialog(
      `Delete ${selectedTaskIds.length} Tasks`,
      'Are you sure you want to delete the selected tasks? This cannot be undone.',
      async () => {
        try {
          await dispatch(deleteMultipleTasks(selectedTaskIds as string[])).unwrap()
          enqueueSnackbar('Selected tasks deleted successfully!', {
            variant: 'success'
          })
          setSelectedTaskIds([])
          refreshGrid()
        } catch (err: any) {
          enqueueSnackbar(err.message || 'Failed to delete tasks', {
            variant: 'error'
          })
        } finally {
          setDialogOpen(false)
        }
      }
    )
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
      refreshGrid()
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to save task', {
        variant: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columnDefs: ColDef[] = [
    {
      field: '_id',
      headerName: 'ID',
      width: 220,
      filter: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 250,
      filter: true
    },
    {
      field: 'userId',
      headerName: 'Assigned To',
      width: 200,
      filter: true,
      cellRenderer: (params: any) => {
        const user = users.find(u => u._id === params.data.userId)
        if (!user) return 'N/A'
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              alt={user.name}
              src={
                user.profileImage
                  ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${user.profileImage}`
                  : undefined
              }
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant='body2'>{user.name}</Typography>
          </Box>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      filter: true
    },
    {
      field: 'createdAt',
      headerName: 'Created On',
      width: 180,
      filter: true,
      valueFormatter: params => params.value && new Date(params.value).toLocaleDateString()
    },
    {
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => (
        <Box>
          <Tooltip title='View'>
            <IconButton onClick={() => handleOpenViewModal(params.data)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit'>
            <IconButton onClick={() => handleOpenFormModal(params.data)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete'>
            <IconButton onClick={() => handleDelete(params.data._id)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#232C65' }}>
          Task Management
        </Typography>
        <Box>
          {selectedTaskIds.length > 0 && (
            <Button
              variant='outlined'
              color='error'
              startIcon={<Delete />}
              onClick={handleDeleteSelected}
              sx={{ mr: 2 }}
            >
              Delete ({selectedTaskIds.length})
            </Button>
          )}
          <Button variant='contained' startIcon={<Add />} onClick={() => handleOpenFormModal()}>
            New Task
          </Button>
        </Box>
      </Box>
      <Paper sx={{ height: '75vh', width: '100%' }}>
        {loading === 'pending' && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity='error'>{error}</Alert>}
        <div className='ag-theme-material' style={{ height: '100%', width: '100%' }}>
          <AgGridReact<Task>
            rowData={tasks}
            columnDefs={columnDefs}
            defaultColDef={{
              flex: 1,
              minWidth: 100,
              sortable: true,
              filter: true
            }}
            paginationPageSizeSelector={[10, 50, 100]}
            getRowId={params => params.data._id}
            rowSelection='multiple'
            suppressRowClickSelection={true}
            onGridReady={onGridReady}
            onSelectionChanged={event => {
              const selectedRows = event.api.getSelectedRows()
              setSelectedTaskIds(selectedRows.map(row => row._id))
            }}
            onPaginationChanged={handlePaginationChanged}
            onSortChanged={handleSortChanged}
            animateRows={true}
            pagination={true}
            paginationPageSize={pageSize}
            suppressPaginationPanel={false}
          />
        </div>
      </Paper>

      {/* Modals and Dialogs */}
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
              users={users}
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
  )
}
