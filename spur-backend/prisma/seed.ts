import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding database...');
  
  // Optional: Add any initial data here
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });