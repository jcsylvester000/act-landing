// Prisma client singleton — safe for Next.js dev hot-reload and serverless.
// Activate after running:  npm i prisma @prisma/client && npx prisma generate
// Then set DATABASE_URL / DIRECT_URL in .env (see .env.example) and run:
//   npx prisma migrate dev --name init   (local/dev)
//   npx prisma migrate deploy            (production)
//
// NOTE: This file intentionally avoids a hard import of '@prisma/client'
// until the package is installed, so the current store-based build keeps
// compiling. Swap to the commented version when wiring Neon.

/*
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
*/

export {}; // placeholder module until Prisma is installed
