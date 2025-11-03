'use client'

import {
  Alert,
  Anchor,
  Container,
  Loader,
  Paper,
  PasswordInput,
  rem,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import Link from 'next/link'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { checkEmailExists, register } from '@/app/actions/auth'
import { SubmitButton } from '@/components/SubmitButton'
import { registerSchema } from '@/lib/validations/auth'

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailIsAvailable, setEmailIsAvailable] = useState(false)
  const [, startTransition] = useTransition()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (state?.error) {
      // Reset validation errors when server returns an error
      form.clearErrors()
    }
  }, [state, form.clearErrors])

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.currentTarget.value

    // Reset email availability state
    setEmailIsAvailable(false)

    // Only check if email is not empty and has valid format
    if (!email) return

    // Basic email format check
    const emailRegex = /^\S+@\S+$/
    if (!emailRegex.test(email)) return

    setIsCheckingEmail(true)

    try {
      const exists = await checkEmailExists(email)

      if (exists) {
        form.setFieldError('email', 'This email is already registered')
      } else {
        // Email is available - show success indicator
        setEmailIsAvailable(true)
      }
    } catch (error) {
      console.error('Error checking email:', error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleEmailChange = () => {
    // Reset availability indicator when user changes email
    setEmailIsAvailable(false)
  }

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('email', values.email)
    formData.append('password', values.password)
    formData.append('confirmPassword', values.confirmPassword)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Create an account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" component={Link} href="/login">
          Sign in
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
            label="Name"
            placeholder="Your name"
            withAsterisk
            key={form.key('name')}
            {...form.getInputProps('name')}
            autoComplete="name"
          />
          <TextInput
            label="Email"
            placeholder="your@email.com"
            withAsterisk
            mt="md"
            key={form.key('email')}
            {...form.getInputProps('email')}
            onChange={(e) => {
              form.getInputProps('email').onChange(e)
              handleEmailChange()
            }}
            onBlur={handleEmailBlur}
            rightSection={
              isCheckingEmail ? (
                <Loader size="xs" />
              ) : emailIsAvailable ? (
                <IconCheck
                  style={{ width: rem(20), height: rem(20) }}
                  color="green"
                />
              ) : null
            }
            autoComplete="email"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            withAsterisk
            mt="md"
            key={form.key('password')}
            {...form.getInputProps('password')}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            withAsterisk
            mt="md"
            key={form.key('confirmPassword')}
            {...form.getInputProps('confirmPassword')}
            autoComplete="new-password"
          />
          <SubmitButton fullWidth mt="xl">
            Create account
          </SubmitButton>
        </form>
      </Paper>
    </Container>
  )
}
