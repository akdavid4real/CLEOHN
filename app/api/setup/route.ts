import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { hash } from '@node-rs/argon2'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    // SECURITY: Disable in production - use proper deployment process instead
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "Setup endpoint disabled in production. Use proper deployment process." },
        { status: 403 }
      );
    }

    const body = await request.json()
    const { setupKey, email, password } = body

    // Security: Require a strong setup key from environment (NO DEFAULT)
    const expectedKey = process.env.SETUP_KEY;

    if (!expectedKey || expectedKey.length < 32) {
      return Response.json(
        { error: 'SETUP_KEY environment variable not configured or too weak (minimum 32 characters)' },
        { status: 500 }
      );
    }

    if (setupKey !== expectedKey) {
      return Response.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    const adminEmail = email || 'admin@cleohn.com'
    const adminPassword = password || 'Admin123!'

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .get()

    if (existingAdmin) {
      return Response.json(
        { message: 'Admin user already exists', email: adminEmail },
        { status: 200 }
      )
    }

    // Create admin user
    const hashedPassword = await hash(adminPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })
    const adminId = nanoid()

    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
    })

    return Response.json(
      {
        success: true,
        message: 'Admin user created successfully',
        email: adminEmail,
        password: adminPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Setup error:', error)
    return Response.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
