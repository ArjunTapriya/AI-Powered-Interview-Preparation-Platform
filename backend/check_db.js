const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'arjun@example.com' }});
    if (!user) {
      console.log("User arjun@example.com not found!");
      return;
    }
    console.log("User ID:", user.id);
    
    const guides = await prisma.prepGuide.findMany({ where: { userId: user.id }});
    console.log("PrepGuides:", JSON.stringify(guides, null, 2));
    
    const history = await prisma.interviewSession.findMany({ where: { userId: user.id }});
    console.log("InterviewSessions Count:", history.length);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
