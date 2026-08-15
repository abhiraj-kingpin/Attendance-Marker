/*
  Warnings:

  - Added the required column `updatedAt` to the `Geofence` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Geofence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "label" TEXT NOT NULL,
    "roomNumber" TEXT,
    "building" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "radiusM" REAL NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Geofence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Geofence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Geofence" ("building", "createdAt", "id", "label", "latitude", "longitude", "radiusM", "roomNumber", "subjectId", "userId") SELECT "building", "createdAt", "id", "label", "latitude", "longitude", "radiusM", "roomNumber", "subjectId", "userId" FROM "Geofence";
DROP TABLE "Geofence";
ALTER TABLE "new_Geofence" RENAME TO "Geofence";
CREATE INDEX "Geofence_userId_idx" ON "Geofence"("userId");
CREATE INDEX "Geofence_subjectId_idx" ON "Geofence"("subjectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
