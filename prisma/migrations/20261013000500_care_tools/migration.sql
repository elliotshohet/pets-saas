ALTER TABLE "Pet" ADD COLUMN "photoUrl" TEXT, ADD COLUMN "microchip" TEXT, ADD COLUMN "allergies" TEXT, ADD COLUMN "emergencyContact" TEXT, ADD COLUMN "medications" TEXT;
CREATE TABLE "PetMedia" ("id" TEXT PRIMARY KEY, "petId" TEXT NOT NULL REFERENCES "Pet"("id") ON DELETE CASCADE, "recordId" TEXT REFERENCES "MedicalRecord"("id") ON DELETE CASCADE, "kind" TEXT NOT NULL, "name" TEXT NOT NULL, "mime" TEXT NOT NULL, "data" BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "PetMedia_petId_idx" ON "PetMedia"("petId");
CREATE INDEX "PetMedia_recordId_idx" ON "PetMedia"("recordId");
CREATE TABLE "CareTask" ("id" TEXT PRIMARY KEY, "petId" TEXT NOT NULL REFERENCES "Pet"("id") ON DELETE CASCADE, "title" TEXT NOT NULL, "kind" TEXT NOT NULL, "dueDate" DATE NOT NULL, "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles', "intervalDays" INTEGER, "instructions" TEXT, "completedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "CareTask_petId_dueDate_idx" ON "CareTask"("petId", "dueDate");
CREATE TABLE "CareLog" ("id" TEXT PRIMARY KEY, "petId" TEXT NOT NULL REFERENCES "Pet"("id") ON DELETE CASCADE, "date" DATE NOT NULL, "weightKg" DOUBLE PRECISION, "observation" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "CareLog_petId_date_idx" ON "CareLog"("petId", "date");
