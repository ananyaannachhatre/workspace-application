const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOAuth() {
  try {
    console.log('=== Cleaning up OAuth accounts ===');
    
    // Delete all OAuth accounts (keep only credentials)
    const deletedAccounts = await prisma.account.deleteMany({
      where: {
        provider: {
          in: ['github', 'gitlab']
        }
      }
    });
    
    console.log(`Deleted ${deletedAccounts.count} OAuth accounts`);
    
    // Delete all sessions (force fresh login)
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} sessions`);
    
    console.log('=== Cleanup complete ===');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOAuth();
