import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      hashedPassword: 'hashed_password_123',
      projects: {
        create: [
          {
            title: 'Website Redesign',
            description: 'Complete redesign of company website',
            tasks: {
              create: [
                {
                  title: 'Design homepage',
                  description: 'Create new layout for homepage',
                  status: 'in-progress',
                  dueDate: new Date('2023-12-15'),
                  orderNumber: 1,
                },
                {
                  title: 'Implement mobile view',
                  status: 'todo',
                  dueDate: new Date('2023-12-20'),
                  orderNumber: 2,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      projects: {
        include: {
          tasks: true,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      hashedPassword: 'hashed_password_456',
      projects: {
        create: [
          {
            title: 'Marketing Campaign',
            description: 'Q1 marketing initiatives',
            tasks: {
              create: [
                {
                  title: 'Create social media content',
                  status: 'done',
                  dueDate: new Date('2023-11-30'),
                  orderNumber: 1,
                },
                {
                  title: 'Schedule email campaign',
                  description: 'Prepare and schedule newsletter',
                  status: 'todo',
                  dueDate: new Date('2023-12-10'),
                  orderNumber: 2,
                },
                {
                  title: 'Analyze campaign metrics',
                  status: 'todo',
                  dueDate: new Date('2023-12-25'),
                  orderNumber: 3,
                },
              ],
            },
          },
          {
            title: 'Product Development',
            tasks: {
              create: [
                {
                  title: 'User research',
                  description: 'Conduct interviews with potential users',
                  status: 'in-progress',
                  orderNumber: 1,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      projects: {
        include: {
          tasks: true,
        },
      },
    },
  });

  console.log('Seeded users:', { user1, user2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });