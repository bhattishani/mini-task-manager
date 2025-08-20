'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import Loader from '@/components/ui/Loader'
import Header from '@/components/ui/Header'

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const token = getToken()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !token) {
      router.replace('/login')
    }
  }, [router, token, isMounted])

  if (!isMounted || !token) {
    return <Loader />
  }

  return (
    <>
      <Header />
      {children}
    </>
  )
}
