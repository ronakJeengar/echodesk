import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial EchoDesk production database...');

  // Create Default Demo User & Workspace
  const passwordHash = await bcrypt.hash('EchoDeskDemo2026!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'technician@echodesk.ai' },
    update: {},
    create: {
      email: 'technician@echodesk.ai',
      passwordHash,
      fullName: 'Alex Miller (Lead Field Tech)',
      role: 'ADMIN',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'apex-contractors' },
    update: {},
    create: {
      name: 'Apex Field Services',
      slug: 'apex-contractors',
      domain: 'apex-services.com',
      industry: 'HVAC',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log(`✓ Seeded default workspace "${workspace.name}" (ID: ${workspace.id}) for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
