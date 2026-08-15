-- CreateTable
CREATE TABLE "PredictionCorrection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "expectedBlockId" TEXT,
    "actualBlockId" TEXT,
    "reason" TEXT,
    "accuracyImpact" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PredictionCorrection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PredictionCorrection_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "teacher" TEXT,
    "credits" INTEGER,
    "courseType" TEXT,
    "roomNumber" TEXT,
    "color" TEXT,
    "tags" TEXT,
    "commencementDate" TEXT,
    "semesterWeeks" INTEGER NOT NULL DEFAULT 16,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subject" ("code", "color", "courseType", "createdAt", "credits", "id", "name", "roomNumber", "tags", "teacher", "updatedAt", "userId") SELECT "code", "color", "courseType", "createdAt", "credits", "id", "name", "roomNumber", "tags", "teacher", "updatedAt", "userId" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE INDEX "Subject_userId_idx" ON "Subject"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PredictionCorrection_userId_subjectId_idx" ON "PredictionCorrection"("userId", "subjectId");
