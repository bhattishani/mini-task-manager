'use client'

import { Box, Typography, Paper, Divider, Chip, Grid } from '@mui/material'
import { CalendarToday, Update, CheckCircle } from '@mui/icons-material'
import { Task } from '@/types/task'

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

interface TaskViewProps {
  task: Task
}

export default function TaskView({ task }: TaskViewProps) {
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Chip
          label={task.status}
          color={task.status === 'completed' ? 'success' : 'warning'}
          size='small'
          sx={{ textTransform: 'capitalize', mb: 2 }}
        />
        <Typography variant='h4' component='h2' sx={{ fontWeight: 'bold', color: '#232C65' }}>
          {task.title}
        </Typography>
      </Box>

      <Paper variant='outlined' sx={{ p: 2, my: 2, maxHeight: '300px', overflowY: 'auto' }}>
        <Typography variant='body1' component='div' dangerouslySetInnerHTML={{ __html: task.description }} />
      </Paper>

      <Grid container spacing={2} sx={{ color: 'text.secondary' }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ mr: 1 }} fontSize='small' />
            <Typography variant='body2'>
              <strong>Created:</strong> {formatDate(task.createdAt)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Update sx={{ mr: 1 }} fontSize='small' />
            <Typography variant='body2'>
              <strong>Updated:</strong> {formatDate(task.updatedAt)}
            </Typography>
          </Box>
        </Grid>
        {task.completedAt && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1 }} fontSize='small' color='success' />
              <Typography variant='body2'>
                <strong>Completed:</strong> {formatDate(task.completedAt)}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
