import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  variant?: 'primary' | 'error'
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  variant = 'primary'
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} autoFocus color={variant === 'error' ? 'error' : 'primary'} variant='contained'>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
