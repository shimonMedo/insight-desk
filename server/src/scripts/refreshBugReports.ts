import "dotenv/config";
import fs from "fs";
import path from "path";
import prismaPackage from "@prisma/client";

const { PrismaClient } = prismaPackage;
const prisma = new PrismaClient();

type TicketRecord = {
  id: string;
  userQuestion: string;
  aiAnswer: string;
  failureReason: string | null;
  suggestedFix: string | null;
  fixType: string | null;
  triage: string;
  repeatCount: number;
  routeToInsights: boolean;
  surfaceReason: string | null;
  status: string;
  createdAt: Date;
};

function toBugId(ticketId: string) {
  return `BUG-${ticketId.slice(-6).toUpperCase()}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function buildReport(tickets: TicketRecord[]) {
  const insightTickets = tickets.filter((ticket) => ticket.routeToInsights);
  const openTickets = insightTickets.filter((ticket) => ticket.status !== "fixed").length;
  const fixedTickets = insightTickets.filter((ticket) => ticket.status === "fixed").length;

  const lines = [
    "# Bug Reports",
    "",
    "This file is generated from InsightDesk ticket data.",
    "Use it as a curated engineering backlog for review and fixes.",
    "",
    `Generated: ${formatDate(new Date())}`,
    `Support tickets in database: ${tickets.length}`,
    `Tickets routed to insights: ${insightTickets.length}`,
    `Open or active insight tickets: ${openTickets}`,
    `Fixed insight tickets: ${fixedTickets}`,
    "",
    "## How To Use",
    "",
    "1. Run the refresh command to pull the latest tickets from the database.",
    "2. Review the items below and decide which ones should be fixed next.",
    "3. Fix issues manually or ask the agent to address one or more BUG IDs.",
    "",
  ];

  if (insightTickets.length === 0) {
    lines.push("## No Issues Found", "", "There are no tickets in the database right now.", "");
    return lines.join("\n");
  }

  insightTickets.forEach((ticket) => {
    lines.push(`## ${toBugId(ticket.id)} - ${ticket.fixType || "Support issue"}`);
    lines.push(`- Ticket ID: ${ticket.id}`);
    lines.push(`- Status: ${ticket.status}`);
    lines.push(`- Triage: ${ticket.triage}`);
    lines.push(`- Repeat count: ${ticket.repeatCount}`);
    lines.push(`- Surfaced because: ${ticket.surfaceReason || "Product review"}`);
    lines.push(`- Created: ${formatDate(ticket.createdAt)}`);
    lines.push("");
    lines.push("### User Question");
    lines.push(ticket.userQuestion);
    lines.push("");
    lines.push("### Assistant Answer");
    lines.push(ticket.aiAnswer);
    lines.push("");
    lines.push("### Failure Reason");
    lines.push(ticket.failureReason || "No failure analysis available.");
    lines.push("");
    lines.push("### Suggested Fix");
    lines.push(ticket.suggestedFix || "No suggested fix available.");
    lines.push("");
  });

  return lines.join("\n");
}

async function main() {
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const reportPath = path.join(process.cwd(), "..", "BUG_REPORTS.md");
  const content = buildReport(tickets as TicketRecord[]);

  fs.writeFileSync(reportPath, content, "utf8");
  console.log(
    `Updated BUG_REPORTS.md with ${tickets.filter((ticket) => ticket.routeToInsights).length} routed insight tickets.`,
  );
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
