-- AlterTable
ALTER TABLE "Geofence" ADD COLUMN "building" TEXT;
ALTER TABLE "Geofence" ADD COLUMN "roomNumber" TEXT;

-- CreateIndex
CREATE INDEX "Geofence_subjectId_idx" ON "Geofence"("subjectId");
