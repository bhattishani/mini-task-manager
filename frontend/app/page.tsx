'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import Loader from '@/components/ui/Loader'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.replace('/admin')
      }
      router.replace('/tasks')
    } else {
      router.replace('/login')
    }
  }, [router, isAuthenticated])

  return <Loader />
}
