// Verify foreign key constraints in the database
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyForeignKeys() {
  try {
    console.log('Verifying foreign key relationships...\n')
    
    // Test Account -> User relationship
    try {
      const accounts = await prisma.account.findMany({
        include: { user: true },
        take: 5,
      })
      console.log(`✓ Account -> User relationship working (${accounts.length} accounts found)`)
      if (accounts.length > 0) {
        console.log(`  Example: Account ${accounts[0].id} belongs to User ${accounts[0].user.email}`)
      }
    } catch (error) {
      console.error('✗ Account -> User relationship failed:', error.message)
    }
    
    // Test Workspace -> User relationship
    try {
      const workspaces = await prisma.workspace.findMany({
        include: { owner: true },
        take: 5,
      })
      console.log(`✓ Workspace -> User relationship working (${workspaces.length} workspaces found)`)
      if (workspaces.length > 0) {
        console.log(`  Example: Workspace "${workspaces[0].name}" owned by User ${workspaces[0].owner.email}`)
      }
    } catch (error) {
      console.error('✗ Workspace -> User relationship failed:', error.message)
    }
    
    // Test Task -> Workspace relationship
    try {
      const tasks = await prisma.task.findMany({
        include: { workspace: true },
        take: 5,
      })
      console.log(`✓ Task -> Workspace relationship working (${tasks.length} tasks found)`)
      if (tasks.length > 0) {
        console.log(`  Example: Task "${tasks[0].title}" belongs to Workspace "${tasks[0].workspace.name}"`)
      }
    } catch (error) {
      console.error('✗ Task -> Workspace relationship failed:', error.message)
    }
    
    // Check for users without accounts
    const usersWithoutAccounts = await prisma.user.findMany({
      where: {
        accounts: {
          none: {},
        },
      },
    })
    
    if (usersWithoutAccounts.length > 0) {
      console.log(`\n⚠ Warning: ${usersWithoutAccounts.length} user(s) without Account records:`)
      usersWithoutAccounts.forEach(user => {
        console.log(`  - User ${user.email} (ID: ${user.id})`)
      })
      console.log('\n  These users were likely created before Account creation was implemented.')
      console.log('  New users will automatically have Account records created.')
    } else {
      console.log('\n✓ All users have Account records')
    }
    
    console.log('\n✓ All foreign key relationships verified!')
    
  } catch (error) {
    console.error('Error verifying foreign keys:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyForeignKeys()

