import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-utils';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting auth seed...');

  const org1 = await prisma.organization.upsert({
    where: { slug: 'sales-impact' },
    update: {},
    create: {
      name: 'Sales Impact',
      slug: 'sales-impact',
    },
  });

  console.log(`✅ Created organization: ${org1.name}`);

  const org2 = await prisma.organization.upsert({
    where: { slug: 'tech-solutions' },
    update: {},
    create: {
      name: 'Tech Solutions',
      slug: 'tech-solutions',
    },
  });

  console.log(`✅ Created organization: ${org2.name}`);

  const password = await hashPassword('senha123');

  const adminUser = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'admin@salesimpact.com',
        organizationId: org1.id,
      },
    },
    update: {},
    create: {
      email: 'admin@salesimpact.com',
      name: 'Admin User',
      password: password,
      role: 'admin',
      organizationId: org1.id,
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);

  const managerUser = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'manager@salesimpact.com',
        organizationId: org1.id,
      },
    },
    update: {},
    create: {
      email: 'manager@salesimpact.com',
      name: 'Manager User',
      password: password,
      role: 'manager',
      organizationId: org1.id,
    },
  });

  console.log(`✅ Created manager user: ${managerUser.email}`);

  const sdrUser = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'sdr@salesimpact.com',
        organizationId: org1.id,
      },
    },
    update: {},
    create: {
      email: 'sdr@salesimpact.com',
      name: 'SDR User',
      password: password,
      role: 'sdr',
      organizationId: org1.id,
    },
  });

  console.log(`✅ Created SDR user: ${sdrUser.email}`);

  const adminOrg2 = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'admin@techsolutions.com',
        organizationId: org2.id,
      },
    },
    update: {},
    create: {
      email: 'admin@techsolutions.com',
      name: 'Admin Tech Solutions',
      password: password,
      role: 'admin',
      organizationId: org2.id,
    },
  });

  console.log(`✅ Created admin user for org2: ${adminOrg2.email}`);

  console.log('\n📋 Credentials:');
  console.log('Organization 1 (Sales Impact):');
  console.log('  Admin: admin@salesimpact.com / senha123');
  console.log('  Manager: manager@salesimpact.com / senha123');
  console.log('  SDR: sdr@salesimpact.com / senha123');
  console.log('\nOrganization 2 (Tech Solutions):');
  console.log('  Admin: admin@techsolutions.com / senha123');

  console.log('\n✅ Auth seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

