import { Medication } from "@prisma/client";

export function getMedicationStatus(medication: Pick<Medication, "quantity" | "reorderThreshold" | "reorderStatus">) {
  if (medication.reorderStatus === "ordered") {
    return "Ordered";
  }

  if (medication.quantity <= medication.reorderThreshold) {
    return medication.reorderStatus === "pending" ? "Needs Reorder" : "Low Stock";
  }

  return "In Stock";
}
