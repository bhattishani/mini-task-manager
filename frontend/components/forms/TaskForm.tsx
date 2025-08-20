'use client'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Avatar
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Title
} from '@mui/icons-material'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Task } from '@/types/task'
import { User } from '@/types/user'

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1 }}>
      <ToggleButtonGroup size='small' aria-label='text formatting'>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          selected={editor.isActive('bold')}
          value='bold'
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          selected={editor.isActive('italic')}
          value='italic'
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          selected={editor.isActive('strike')}
          value='strike'
        >
          <FormatStrikethrough />
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
      <ToggleButtonGroup size='small' aria-label='heading formatting'>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          selected={editor.isActive('heading', { level: 1 })}
          value='h1'
        >
          <Title />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          selected={editor.isActive('heading', { level: 2 })}
          value='h2'
        >
          <Typography variant='button'>H2</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
      <ToggleButtonGroup size='small' aria-label='list formatting'>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          selected={editor.isActive('bulletList')}
          value='bulletList'
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          selected={editor.isActive('orderedList')}
          value='orderedList'
        >
          <FormatListNumbered />
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
      <ToggleButtonGroup size='small' aria-label='block formatting'>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          selected={editor.isActive('blockquote')}
          value='blockquote'
        >
          <FormatQuote />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          selected={editor.isActive('codeBlock')}
          value='codeBlock'
        >
          <Code />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

interface TaskFormProps {
  task?: Task | null
  onSubmit: (values: any, helpers: any) => void
  onCancel: () => void
  isSubmitting: boolean
  users?: User[]
}

const TaskSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().min(10, 'Description is too short!').required('Description is required'),
  status: Yup.string().oneOf(['pending', 'completed'], 'Invalid status').required('Status is required'),
  userId: Yup.string().when('users', {
    is: (users: User[]) => Array.isArray(users) && users.length > 0,
    then: schema => schema.required('A user must be assigned'),
    otherwise: schema => schema.optional()
  })
})

export default function TaskForm({ task, onSubmit, onCancel, isSubmitting, users = [] }: TaskFormProps) {
  const formik = useFormik({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'pending',
      userId: typeof task?.userId === 'string' ? task.userId : ''
    },
    validationSchema: TaskSchema,
    onSubmit: onSubmit,
    enableReinitialize: true
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: formik.values.description,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      formik.setFieldValue('description', html === '<p></p>' ? '' : html)
    }
  })

  return (
    <Box component='form' onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      {users.length > 0 && (
        <FormControl fullWidth margin='normal' error={formik.touched.userId && Boolean(formik.errors.userId)}>
          <InputLabel id='user-select-label'>Assign to User</InputLabel>
          <Select
            labelId='user-select-label'
            id='userId'
            name='userId'
            value={formik.values.userId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label='Assign to User'
          >
            {users.map(user => (
              <MenuItem key={user._id} value={user._id}>
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
                  <Box>
                    <Typography variant='body2'>{user.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {formik.touched.userId && formik.errors.userId && <FormHelperText>{formik.errors.userId}</FormHelperText>}
        </FormControl>
      )}

      <TextField
        margin='normal'
        fullWidth
        id='title'
        label='Title'
        name='title'
        autoFocus={users.length === 0}
        value={formik.values.title}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.title && Boolean(formik.errors.title)}
        helperText={formik.touched.title && formik.errors.title}
      />

      <FormControl fullWidth margin='normal' error={formik.touched.description && Boolean(formik.errors.description)}>
        <Typography variant='subtitle1' sx={{ mb: 1, color: 'text.secondary' }}>
          Description
        </Typography>
        <Paper
          variant='outlined'
          sx={{
            borderColor: formik.touched.description && formik.errors.description ? 'error.main' : 'rgba(0, 0, 0, 0.23)'
          }}
        >
          <MenuBar editor={editor} />
          <Divider />
          <Box
            sx={{
              minHeight: '250px',
              p: 1,
              '& .tiptap': {
                outline: 'none'
              },
              '& .tiptap p.is-editor-empty:first-of-type::before': {
                content: '"Write something…"',
                float: 'left',
                color: '#adb5bd',
                pointerEvents: 'none',
                height: 0
              }
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </Paper>
        {formik.touched.description && formik.errors.description && (
          <FormHelperText>{formik.errors.description}</FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth margin='normal' error={formik.touched.status && Boolean(formik.errors.status)}>
        <InputLabel id='status-label'>Status</InputLabel>
        <Select
          labelId='status-label'
          id='status'
          name='status'
          value={formik.values.status}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          label='Status'
        >
          <MenuItem value='pending'>Pending</MenuItem>
          <MenuItem value='completed'>Completed</MenuItem>
        </Select>
        {formik.touched.status && formik.errors.status && <FormHelperText>{formik.errors.status}</FormHelperText>}
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          type='submit'
          variant='contained'
          disabled={isSubmitting}
          sx={{ bgcolor: '#232C65', '&:hover': { bgcolor: '#1a204d' } }}
        >
          {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Save Task'}
        </Button>
      </Box>
    </Box>
  )
}
