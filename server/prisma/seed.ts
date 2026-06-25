import "dotenv/config";
import prismaPackage from "@prisma/client";

const { PrismaClient } = prismaPackage;

const prisma = new PrismaClient();

const sampleTickets = [
  {
    userQuestion: "Why did the low-stock badge appear but no reorder shortcut showed up?",
    aiAnswer:
      "Open the item details page and retry the update from the actions panel.",
    wasHelpful: false,
    failureReason:
      "The answer points to an item details page that does not exist in the current workflow.",
    suggestedFix:
      "Expose reorder guidance directly from the main inventory board when stock falls below threshold.",
    fixType: "Workflow improvement",
    triage: "product_gap",
    topicKey: "product-gap-reorder-workflow-ui-visibility",
    repeatCount: 2,
    routeToInsights: true,
    surfaceReason: "Classified as a product or UX gap worth reviewing.",
    status: "new",
  },
  {
    userQuestion: "Why did my shipment status stay pending after stock was removed?",
    aiAnswer:
      "Shipment status can remain pending if the processing step was not completed.",
    wasHelpful: false,
    failureReason:
      "The answer describes a generic cause but does not tell the user what to check next inside the product.",
    suggestedFix:
      "Add a clearer explanation of pending state and a next-step hint inside the support answer.",
    fixType: "Support content",
    triage: "support_guidance",
    topicKey: "support-guidance-shipment-status-status-explanation",
    repeatCount: 1,
    routeToInsights: false,
    surfaceReason: null,
    status: "reviewed",
  },
  {
    userQuestion: "Where can I review unresolved support issues from the chat?",
    aiAnswer:
      "Open the insights dashboard to review unresolved support escalations.",
    wasHelpful: false,
    failureReason:
      "The answer assumes the user already knows where the dashboard is and what it contains.",
    suggestedFix:
      "Link directly to the insights dashboard from the support page and explain what users will find there.",
    fixType: "Navigation improvement",
    triage: "product_gap",
    topicKey: "product-gap-insights-dashboard-navigation-confusion",
    repeatCount: 2,
    routeToInsights: true,
    surfaceReason: "Similar support friction has appeared more than once.",
    status: "new",
  },
  {
    userQuestion: "How do I know that a reorder was already placed for a medication?",
    aiAnswer:
      "You can check whether the reorder status is marked as ordered in the inventory table.",
    wasHelpful: true,
    failureReason: null,
    suggestedFix: null,
    fixType: null,
    triage: "needs_human_support",
    topicKey: "needs-human-support-reorder-workflow-status-explanation",
    repeatCount: 1,
    routeToInsights: false,
    surfaceReason: null,
    status: "fixed",
  },
];

const sampleMedications = [
  {
    name: "Amoxicillin 500mg Capsules",
    sku: "PHR-1042",
    category: "Antibiotic",
    quantity: 84,
    reorderThreshold: 20,
    reorderStatus: "none",
  },
  {
    name: "Ibuprofen 200mg Tablets",
    sku: "PHR-2311",
    category: "Pain Relief",
    quantity: 18,
    reorderThreshold: 25,
    reorderStatus: "pending",
  },
  {
    name: "Insulin Pen Pack",
    sku: "PHR-7784",
    category: "Diabetes Care",
    quantity: 12,
    reorderThreshold: 16,
    reorderStatus: "ordered",
  },
  {
    name: "Saline IV Solution",
    sku: "PHR-6508",
    category: "IV Supplies",
    quantity: 46,
    reorderThreshold: 15,
    reorderStatus: "none",
  },
  {
    name: "Epinephrine Auto-Injector",
    sku: "PHR-9103",
    category: "Emergency Care",
    quantity: 6,
    reorderThreshold: 10,
    reorderStatus: "pending",
  },
];

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.ticket.createMany({
    data: sampleTickets,
  });
  await prisma.medication.createMany({
    data: sampleMedications,
  });
  console.log(
    `Seeded ${sampleTickets.length} tickets and ${sampleMedications.length} medications.`,
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
