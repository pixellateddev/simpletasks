'use client'

import {
  Alert,
  Anchor,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import Link from 'next/link'
import { useActionState, useEffect, useTransition } from 'react'
import { login } from '@/app/actions/auth'
import { SubmitButton } from '@/components/SubmitButton'
import { loginSchema } from '@/lib/validations/auth'

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null)
  const [, startTransition] = useTransition()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (state?.error) {
      // Reset validation errors when server returns an error
      form.clearErrors()
    }
  }, [state, form.clearErrors])

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Welcome back
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor size="sm" component={Link} href="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {state?.error && (
            <Alert color="red" mb="md">
              {state.error}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="your@email.com"
            withAsterisk
            key={form.key('email')}
            {...form.getInputProps('email')}
            autoComplete="email"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            withAsterisk
            mt="md"
            key={form.key('password')}
            {...form.getInputProps('password')}
            autoComplete="current-password"
          />
          <SubmitButton fullWidth mt="xl">
            Sign in
          </SubmitButton>
        </form>
      </Paper>
    </Container>
  )
}
