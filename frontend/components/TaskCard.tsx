'use client'

import {
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Paper,
  Divider,
  Button,
  Tooltip,
  Checkbox
} from '@mui/material'
import { Edit, Delete, CheckCircleOutline, RadioButtonUnchecked, CalendarToday, Visibility } from '@mui/icons-material'
import { Task } from '@/types/task'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onUpdateStatus: (task: Task) => void
}

export default function TaskCard({
  task,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus
}: TaskCardProps) {
  const isCompleted = task.status === 'completed'

  return (
    <Paper
      elevation={isSelected ? 6 : 2}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(task._id)}
          sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
        <CardContent sx={{ flexGrow: 1, pt: 5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1
            }}
          >
            <Typography
              variant='h6'
              component='div'
              sx={{
                fontWeight: '500',
                color: '#232C65',
                textDecoration: isCompleted ? 'line-through' : 'none',
                opacity: isCompleted ? 0.7 : 1
              }}
            >
              {task.title}
            </Typography>
            <Chip
              label={task.status}
              color={isCompleted ? 'success' : 'warning'}
              size='small'
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          <Box
            className='task-description'
            sx={{
              my: 2,
              color: 'text.secondary',
              opacity: isCompleted ? 0.7 : 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              minHeight: '60px',
              maxHeight: '60px',
              '& p': { margin: 0 },
              '& *': {
                margin: 0,
                padding: 0
              }
            }}
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            <CalendarToday sx={{ fontSize: '1rem', mr: 0.5 }} />
            Created: {formatDate(task.createdAt)}
          </Box>
        </CardContent>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'action.hover',
          p: 1,
          mt: 'auto'
        }}
      >
        <Button
          size='small'
          startIcon={isCompleted ? <RadioButtonUnchecked /> : <CheckCircleOutline />}
          onClick={() => onUpdateStatus(task)}
        >
          {isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
        </Button>
        <Box>
          <Tooltip title='View Task'>
            <IconButton size='small' onClick={() => onView(task)}>
              <Visibility fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit Task'>
            <IconButton size='small' onClick={() => onEdit(task)}>
              <Edit fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete Task'>
            <IconButton size='small' onClick={() => onDelete(task._id)}>
              <Delete fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  )
}
