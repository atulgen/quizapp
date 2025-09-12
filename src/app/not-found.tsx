//src/app/_not-found

'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


const NotFound = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [router])

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Redirecting to the home page...</p>
    </div>
  )
}

export default NotFound
