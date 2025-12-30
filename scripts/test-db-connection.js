// Test database connection script
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✓ Database connection successful')
    
    // Test if tables exist by trying to query
    try {
      const userCount = await prisma.user.count()
      console.log(`✓ User table exists (${userCount} users)`)
    } catch (error) {
      console.error('✗ User table does not exist or schema not pushed')
      console.error('  Run: npm run db:push')
      process.exit(1)
    }
    
    try {
      const workspaceCount = await prisma.workspace.count()
      console.log(`✓ Workspace table exists (${workspaceCount} workspaces)`)
    } catch (error) {
      console.error('✗ Workspace table does not exist or schema not pushed')
      console.error('  Run: npm run db:push')
      process.exit(1)
    }
    
    try {
      const taskCount = await prisma.task.count()
      console.log(`✓ Task table exists (${taskCount} tasks)`)
    } catch (error) {
      console.error('✗ Task table does not exist or schema not pushed')
      console.error('  Run: npm run db:push')
      process.exit(1)
    }
    
    console.log('\n✓ All database tables exist and connection is working!')
    
  } catch (error) {
    console.error('✗ Database connection failed:')
    console.error(error.message)
    
    if (error.message.includes('P1001')) {
      console.error('\n  Database server is not reachable.')
      console.error('  Check your DATABASE_URL in .env file')
    } else if (error.message.includes('P1000')) {
      console.error('\n  Authentication failed.')
      console.error('  Check your database credentials in DATABASE_URL')
    } else if (error.message.includes('P1003')) {
      console.error('\n  Database does not exist.')
      console.error('  Create the database first, then update DATABASE_URL')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

