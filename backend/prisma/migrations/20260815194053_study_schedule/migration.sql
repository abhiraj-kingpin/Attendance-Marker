-- CreateTable
CREATE TABLE "StudySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "plannedCompletionDate" TEXT,
    "actualCompletionDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySchedule_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "SyllabusBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StudySchedule_blockId_idx" ON "StudySchedule"("blockId");
