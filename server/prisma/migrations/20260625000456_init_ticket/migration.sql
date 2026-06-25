-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userQuestion" TEXT NOT NULL,
    "aiAnswer" TEXT NOT NULL,
    "wasHelpful" BOOLEAN,
    "failureReason" TEXT,
    "suggestedFix" TEXT,
    "fixType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
