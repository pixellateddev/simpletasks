'use client'

import { Button } from '@mantine/core'
import { useTransition } from 'react'
import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <Button
      onClick={handleLogout}
      loading={isPending}
      variant="light"
      color="red"
    >
      Logout
    </Button>
  )
}
