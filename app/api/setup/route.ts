import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { hash } from '@node-rs/argon2'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { setupKey, email, password } = body

    // Security: Require a setup key from environment
    const expectedKey = process.env.SETUP_KEY || 'cleohn-setup-2026'
    
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
    const hashedPassword = await hash(adminPassword)
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
