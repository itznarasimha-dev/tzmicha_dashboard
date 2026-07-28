import { PrismaClient } from '@prisma/client';

function createPrismaClient() {
  return new PrismaClient({
    log: ['error'],
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

process.on('beforeExit', async () => { await prisma.$disconnect(); });

const CONN_CODES = new Set(['P1001', 'P1002', 'P2024']);
const CONN_MSGS  = ['ConnectionReset', 'connection pool', 'ECONNRESET', '10054', "Can't reach"];

function isConnErr(err: any) {
  return CONN_CODES.has(err?.code) ||
    CONN_MSGS.some(m => err?.message?.includes(m));
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (isConnErr(err) && i < retries - 1) {
        const delay = Math.min(1000 * 2 ** i, 8000); // exponential: 1s, 2s, 4s, 8s
        await new Promise(r => setTimeout(r, delay));
        try { await prisma.$connect(); } catch {}
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}
