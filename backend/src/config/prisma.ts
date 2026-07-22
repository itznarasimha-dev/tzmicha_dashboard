import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown (Prisma 5 compatible)
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isConnErr =
        err?.code === 'P1001' ||
        err?.code === 'P1002' ||
        err?.code === 'P2024' ||
        err?.message?.includes('ConnectionReset') ||
        err?.message?.includes('connection pool') ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('10054');

      if (isConnErr && i < retries - 1) {
        await new Promise(r => setTimeout(r, 600 * (i + 1)));
        try { await prisma.$connect(); } catch {}
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}
