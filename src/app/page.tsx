import { Button, Container, Group, Paper, Text, Title } from '@mantine/core'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { LogoutButton } from '@/components/LogoutButton'

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    // User is logged in - show dashboard
    return (
      <Container size="md" py={80}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Title order={1} mb="md">
            Welcome back, {user.email}!
          </Title>
          <Text c="dimmed" mb="xl">
            You are successfully logged in to SimpleTasks
          </Text>
          <Group>
            <LogoutButton />
          </Group>
        </Paper>
      </Container>
    )
  }

  // User is not logged in - show landing page
  return (
    <Container size="md" py={80}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={1} mb="md" ta="center">
          Welcome to SimpleTasks
        </Title>
        <Text c="dimmed" mb="xl" ta="center" size="lg">
          Get started by creating an account or logging in
        </Text>
        <Group justify="center" gap="md">
          <Link href="/login">
            <Button variant="default" size="md">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="md">
              Create Account
            </Button>
          </Link>
        </Group>
      </Paper>
    </Container>
  )
}
