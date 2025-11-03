'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { createToken, removeAuthToken, setAuthToken } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

export interface ActionResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  user?: {
    id: string
    email: string
    name: string
  }
}

/**
 * Login action
 */
export async function login(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Parse and validate form data with Zod
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = loginSchema.parse(rawData)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password,
    )

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
    })

    // Set auth token in cookies
    await setAuthToken(token)

    // Revalidate and redirect
    revalidatePath('/', 'layout')
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(issue.message)
      }
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      }
    }

    console.error('Login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }

  redirect('/')
}

/**
 * Register action
 */
export async function register(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Parse and validate form data with Zod
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedData = registerSchema.parse(rawData)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
    })

    // Set auth token in cookies
    await setAuthToken(token)

    // Revalidate and redirect
    revalidatePath('/', 'layout')
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(issue.message)
      }
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      }
    }

    console.error('Registration error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }

  redirect('/')
}

/**
 * Logout action
 */
export async function logout() {
  await removeAuthToken()
  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Check if email already exists
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    if (!email) return false

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return !!existingUser
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}
