import prismaPackage from "@prisma/client";

const { PrismaClient } = prismaPackage;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: InstanceType<typeof PrismaClient>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
