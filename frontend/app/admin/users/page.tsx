'use client'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button } from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridApi } from 'ag-grid-community'

import { User } from '@/types/user'
import { fetchUsers, deleteUsers, updateUser } from '@/store/slices/admin/userSlice'
import { enqueueSnackbar } from 'notistack'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

const columns: ColDef[] = [
  {
    field: '_id',
    headerName: 'ID',
    width: 220,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true
  },
  { field: 'name', headerName: 'Name', width: 150, editable: true },
  { field: 'email', headerName: 'Email', width: 250, editable: true },
  { field: 'role', headerName: 'Role', width: 100, editable: true },
  {
    field: 'createdAt',
    headerName: 'Joined On',
    width: 180,
    valueFormatter: params => params.value && new Date(params.value).toLocaleDateString()
  }
]

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading, error } = useSelector((state: RootState) => state.admin.users)
  const [gridApi, setGridApi] = useState<GridApi<User> | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)

  useEffect(() => {
    dispatch(fetchUsers({ page: 0, pageSize: 100, sortField: 'createdAt', sortOrder: 'desc' }))
  }, [dispatch])

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api)
  }, [])

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridApi?.getSelectedNodes() || []
    setSelectedRows(selectedNodes.map((node: any) => node.data._id))
  }, [gridApi])

  const openConfirmationDialog = (title: string, description: string, onConfirm: () => void) => {
    setDialogConfig({ title, description, onConfirm })
    setDialogOpen(true)
  }

  const refreshGrid = useCallback(() => {
    if (gridApi) {
      dispatch(fetchUsers({ page: 0, pageSize: 100, sortField: 'createdAt', sortOrder: 'desc' }))
    }
  }, [gridApi, dispatch])

  const handleDeleteSelected = () => {
    openConfirmationDialog(
      `Delete ${selectedRows.length} Users`,
      'Are you sure you want to delete the selected users? This cannot be undone.',
      async () => {
        const resultAction = await dispatch(deleteUsers(selectedRows))
        if (deleteUsers.fulfilled.match(resultAction)) {
          enqueueSnackbar('Selected users deleted successfully!', {
            variant: 'success'
          })
          refreshGrid()
        } else {
          enqueueSnackbar(resultAction.payload || 'Failed to delete users', {
            variant: 'error'
          })
        }
        setDialogOpen(false)
      }
    )
  }

  const onCellValueChanged = useCallback(
    async (params: any) => {
      const { data, colDef, newValue } = params
      if (colDef.field !== '_id') {
        await dispatch(
          updateUser({
            id: data._id,
            updateData: {
              [colDef.field]: newValue
            }
          })
        )
      }
    },
    [dispatch]
  )

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#232C65' }}>
          User Management
        </Typography>
        {selectedRows.length > 0 && (
          <Button variant='contained' color='error' onClick={handleDeleteSelected}>
            Delete Selected ({selectedRows.length})
          </Button>
        )}
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        {loading === 'pending' && !gridApi && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity='error'>{error}</Alert>}
        <div className='ag-theme-alpine' style={{ height: '100%', width: '100%' }}>
          <AgGridReact<User>
            columnDefs={columns}
            defaultColDef={{
              flex: 1,
              minWidth: 100,
              sortable: true,
              filter: true
            }}
            getRowId={params => params.data._id}
            rowData={users}
            pagination={true}
            paginationPageSize={50}
            onGridReady={onGridReady}
            rowSelection='multiple'
            onSelectionChanged={onSelectionChanged}
            onCellValueChanged={onCellValueChanged}
            suppressRowClickSelection={true}
            animateRows={true}
          />
        </div>
      </Paper>

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
