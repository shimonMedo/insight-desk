import "dotenv/config";
import prismaPackage from "@prisma/client";

const { PrismaClient } = prismaPackage;
const prisma = new PrismaClient();

function extractTicketSuffix(value: string) {
  const normalized = value.trim();

  if (normalized.toUpperCase().startsWith("BUG-")) {
    return normalized.slice(4).toLowerCase();
  }

  return normalized.toLowerCase();
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error("Usage: npm.cmd run bug:fix -- <BUG-ID-or-ticket-id>");
    process.exit(1);
  }

  const normalized = input.trim();
  const suffix = extractTicketSuffix(normalized);

  const ticket = normalized.toUpperCase().startsWith("BUG-")
    ? await prisma.ticket.findFirst({
        where: {
          id: {
            endsWith: suffix,
          },
        },
      })
    : await prisma.ticket.findUnique({
        where: {
          id: normalized,
        },
      });

  if (!ticket) {
    console.error(`Could not find ticket for "${input}".`);
    process.exit(1);
  }

  await prisma.ticket.update({
    where: {
      id: ticket.id,
    },
    data: {
      status: "fixed",
    },
  });

  console.log(`Marked ticket ${ticket.id} as fixed.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
