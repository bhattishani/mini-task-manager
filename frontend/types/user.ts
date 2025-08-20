export interface User {
  _id: string
  name: string
  email: string
  profileImage?: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}
