import { PrismaClient } from '@prisma/client';

// Reuse client across hot reloads in development
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma && process.env.DATABASE_URL) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const prisma = globalForPrisma.prisma || null;

export default prisma;
