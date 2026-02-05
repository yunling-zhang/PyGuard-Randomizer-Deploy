import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teams = [
  { name: "Team A", members: ["John Doe", "Jane Smith", "Alice White"] },
  { name: "Team B", members: ["Bob Brown", "Charlie Green", "Dana Black"] },
  { name: "Team C", members: ["Eva Gray", "Frank Lin", "Grace Kim"] },
  { name: "Team D", members: ["Hank Zhao", "Ivy Chen"] },
  { name: "Team E", members: ["Jack Wu"] },
];

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clear existing data
  await prisma.team.deleteMany();
  console.log('🗑️  Cleared existing teams');
  
  // Create teams
  for (const team of teams) {
    await prisma.team.create({
      data: {
        name: team.name,
        members: team.members,
        status: 'UNPRESENTED',
        active: false
      }
    });
    console.log(`✅ Created team: ${team.name}`);
  }
  
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
