import { User } from './user'

export interface Task {
  _id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  createdAt: string
  updatedAt: string
  completedAt?: string | null
  userId: string | User
}
