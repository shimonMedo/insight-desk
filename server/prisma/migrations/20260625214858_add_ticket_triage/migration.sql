-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userQuestion" TEXT NOT NULL,
    "aiAnswer" TEXT NOT NULL,
    "wasHelpful" BOOLEAN,
    "failureReason" TEXT,
    "suggestedFix" TEXT,
    "fixType" TEXT,
    "triage" TEXT NOT NULL DEFAULT 'needs_human_support',
    "topicKey" TEXT,
    "repeatCount" INTEGER NOT NULL DEFAULT 1,
    "routeToInsights" BOOLEAN NOT NULL DEFAULT false,
    "surfaceReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Ticket" ("aiAnswer", "createdAt", "failureReason", "fixType", "id", "status", "suggestedFix", "updatedAt", "userQuestion", "wasHelpful") SELECT "aiAnswer", "createdAt", "failureReason", "fixType", "id", "status", "suggestedFix", "updatedAt", "userQuestion", "wasHelpful" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
