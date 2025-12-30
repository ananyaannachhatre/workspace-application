const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUsers() {
  try {
    console.log('=== Users in Database ===');
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    });
    
    users.forEach(user => {
      console.log(`User: ${user.email}`);
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Password exists: ${!!user.password}`);
      console.log(`Accounts: ${user.accounts.length}`);
      user.accounts.forEach(account => {
        console.log(`  - ${account.provider}: ${account.providerAccountId}`);
      });
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUsers();
