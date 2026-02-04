import app, { prisma } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to Database');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database connection failed', error);
        process.exit(1);
    }
}

main();
