// import { PrismaClient } from '@prisma/client'; // or your custom output path if you set one
// import { PrismaPg } from '@prisma/adapter-pg';

// import 'dotenv/config'; // if not loaded globally (e.g. via vite/sveltekit plugin)

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
// 	throw new Error('DATABASE_URL is not set');
// }

// const adapter = new PrismaPg({
// 	connectionString,
// 	// Optional: if using non-public schema
// 	// schema: 'my_schema',
// });

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// export const db =
// 	globalForPrisma.prisma ||
// 	new PrismaClient({
// 		adapter,
// 		log: ['warn', 'error'], // or ['query', 'info', 'warn', 'error'] for debugging
// 	});

// if (process.env.NODE_ENV !== 'production') {
// 	globalForPrisma.prisma = db;
// }
