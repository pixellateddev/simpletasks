'use client'

import type { ButtonProps } from '@mantine/core'
import { Button } from '@mantine/core'
import { useFormStatus } from 'react-dom'

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  )
}
