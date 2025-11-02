import { prisma } from '@/lib/prisma'

export async function GET(_request: Request) {
  try {
    // Create a temporary user
    const tempUser = await prisma.user.create({
      data: {
        email: `temp-${Date.now()}@example.com`,
        name: 'Temp User',
        password: 'temp-password-hash', // In production, use proper hashing (bcrypt, argon2, etc.)
      },
    })

    return Response.json({
      success: true,
      message: 'Temporary user created',
      user: {
        id: tempUser.id,
        email: tempUser.email,
        name: tempUser.name,
        createdAt: tempUser.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating temp user:', error)
    return Response.json(
      {
        success: false,
        message: 'Failed to create temporary user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
