import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create a Recruiter
    const hashedPassword = await bcrypt.hash('password123', 10);

    const recruiter = await prisma.user.upsert({
        where: { email: 'recruiter@demo.com' },
        update: {},
        create: {
            email: 'recruiter@demo.com',
            name: 'Sarah Conner',
            password: hashedPassword,
            role: 'RECRUITER',
        },
    });

    console.log('✅ Created Recruiter: recruiter@demo.com');

    // 2. Create Jobs
    const jobs = [
        {
            title: 'Senior Frontend Engineer',
            description: 'We are looking for a React expert to lead our frontend team. Experience with Tailwind and TypeScript is a must.',
            requiredSkills: ['React', 'TypeScript', 'Tailwind', 'Redux'],
            recruiterId: recruiter.id,
        },
        {
            title: 'Backend Developer (Node.js)',
            description: 'Join our backend team to build scalable APIs using Node.js and PostgreSQL.',
            requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
            recruiterId: recruiter.id,
        },
        {
            title: 'Full Stack Developer',
            description: 'Work across the stack with React and Node.js. Great opportunity for generalists.',
            requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
            recruiterId: recruiter.id,
        },
    ];

    for (const job of jobs) {
        await prisma.job.create({ data: job });
    }

    console.log(`✅ Created ${jobs.length} sample jobs.`);
    console.log('🚀 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
