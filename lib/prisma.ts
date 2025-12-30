import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test connection on import in development
if (process.env.NODE_ENV === 'development') {
  prisma.$connect().catch((error) => {
    console.error('Failed to connect to database:', error.message)
    console.error('Make sure:')
    console.error('1. DATABASE_URL is set in .env file')
    console.error('2. Database server is running')
    console.error('3. Schema is pushed: npm run db:push')
  })
}

