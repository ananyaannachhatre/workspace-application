// Migration script to create Account records for existing users without accounts
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateUsersToAccounts() {
  try {
    console.log('Migrating users to have Account records...\n')
    
    // Find users without accounts
    const usersWithoutAccounts = await prisma.user.findMany({
      where: {
        accounts: {
          none: {},
        },
      },
    })
    
    if (usersWithoutAccounts.length === 0) {
      console.log('✓ All users already have Account records. No migration needed.')
      return
    }
    
    console.log(`Found ${usersWithoutAccounts.length} user(s) without Account records.\n`)
    
    for (const user of usersWithoutAccounts) {
      try {
        // Create Account record for credentials-based users
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "credentials",
            provider: "credentials",
            providerAccountId: user.email, // Use email as providerAccountId
          },
        })
        console.log(`✓ Created Account record for user: ${user.email}`)
      } catch (error) {
        console.error(`✗ Failed to create Account for user ${user.email}:`, error.message)
      }
    }
    
    console.log(`\n✓ Migration complete! ${usersWithoutAccounts.length} Account record(s) created.`)
    
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateUsersToAccounts()

