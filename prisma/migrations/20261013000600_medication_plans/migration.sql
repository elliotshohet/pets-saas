CREATE TABLE "MedicationPlan" ("id" TEXT PRIMARY KEY,"petId" TEXT NOT NULL REFERENCES "Pet"("id") ON DELETE CASCADE,"name" TEXT NOT NULL,"dose" TEXT NOT NULL,"frequency" TEXT NOT NULL,"instructions" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "MedicationPlan_petId_idx" ON "MedicationPlan"("petId");
