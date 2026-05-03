import { PrismaClient, RoleName, CampaignStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: RoleName.ADMIN }, update: {}, create: { name: RoleName.ADMIN, description: 'Platform administrator' } }),
    prisma.role.upsert({ where: { name: RoleName.CREATOR }, update: {}, create: { name: RoleName.CREATOR, description: 'Campaign creator' } }),
    prisma.role.upsert({ where: { name: RoleName.DONOR }, update: {}, create: { name: RoleName.DONOR, description: 'Campaign donor' } }),
  ]);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'technology' }, update: {}, create: { name: 'Technology', slug: 'technology' } }),
    prisma.category.upsert({ where: { slug: 'arts' }, update: {}, create: { name: 'Arts & Culture', slug: 'arts' } }),
    prisma.category.upsert({ where: { slug: 'community' }, update: {}, create: { name: 'Community', slug: 'community' } }),
    prisma.category.upsert({ where: { slug: 'environment' }, update: {}, create: { name: 'Environment', slug: 'environment' } }),
    prisma.category.upsert({ where: { slug: 'health' }, update: {}, create: { name: 'Health & Medical', slug: 'health' } }),
    prisma.category.upsert({ where: { slug: 'education' }, update: {}, create: { name: 'Education', slug: 'education' } }),
  ]);

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fundforge.io' },
    update: {},
    create: { email: 'admin@fundforge.io', passwordHash, firstName: 'Admin', lastName: 'User', isVerified: true },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: roles[0].id } },
    update: {},
    create: { userId: adminUser.id, roleId: roles[0].id },
  });

  // Creator user
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@fundforge.io' },
    update: {},
    create: { email: 'creator@fundforge.io', passwordHash, firstName: 'Jane', lastName: 'Creator', isVerified: true },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: creatorUser.id, roleId: roles[1].id } },
    update: {},
    create: { userId: creatorUser.id, roleId: roles[1].id },
  });
  const creator = await prisma.creator.upsert({
    where: { userId: creatorUser.id },
    update: {},
    create: { userId: creatorUser.id, bio: 'Passionate tech innovator', isVerified: true },
  });

  // Donor user
  const donorUser = await prisma.user.upsert({
    where: { email: 'donor@fundforge.io' },
    update: {},
    create: { email: 'donor@fundforge.io', passwordHash, firstName: 'John', lastName: 'Donor', isVerified: true },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: donorUser.id, roleId: roles[2].id } },
    update: {},
    create: { userId: donorUser.id, roleId: roles[2].id },
  });
  await prisma.donor.upsert({
    where: { userId: donorUser.id },
    update: {},
    create: { userId: donorUser.id },
  });

  // Sample campaign
  await prisma.campaign.upsert({
    where: { slug: 'eco-smart-water-purifier' },
    update: {},
    create: {
      creatorId: creator.id,
      categoryId: categories[0].id,
      title: 'Eco Smart Water Purifier',
      slug: 'eco-smart-water-purifier',
      description: 'A revolutionary solar-powered water purifier for remote communities.',
      story: 'Every year, millions lack access to clean water. Our team has developed a solar-powered purification device that can serve 500 people per day at a fraction of the cost...',
      goalAmount: 50000,
      raisedAmount: 32500,
      status: CampaignStatus.ACTIVE,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isFeatured: true,
      donorsCount: 142,
      donationsCount: 165,
    },
  });

  console.log('✅ Seed complete!');
  console.log('📧 Admin: admin@fundforge.io / Admin123!');
  console.log('📧 Creator: creator@fundforge.io / Admin123!');
  console.log('📧 Donor: donor@fundforge.io / Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
