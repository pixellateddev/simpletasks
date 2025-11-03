import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

// Secret key for JWT signing - should be stored in environment variables
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
)

const TOKEN_NAME = 'auth-token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface JWTPayload {
  userId: string
  email: string
}

/**
 * Create a JWT token for a user
 * @param payload - The payload to encode in the token
 * @returns The signed JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Set the authentication token in cookies
 * @param token - The JWT token to set
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
}

/**
 * Get the authentication token from cookies
 * @returns The JWT token or null if not found
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)
  return token?.value || null
}

/**
 * Remove the authentication token from cookies
 */
export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

/**
 * Get the current authenticated user from the token
 * @returns The user payload or null if not authenticated
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken()
  if (!token) return null

  return verifyToken(token)
}
