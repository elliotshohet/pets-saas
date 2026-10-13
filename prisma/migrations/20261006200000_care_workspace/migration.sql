ALTER TABLE "Pet" ADD COLUMN "concerns" TEXT, ADD COLUMN "questions" TEXT;
ALTER TABLE "MedicalRecord" ADD COLUMN "observations" TEXT;
CREATE TABLE "Attachment" (
 "id" TEXT NOT NULL PRIMARY KEY, "recordId" TEXT NOT NULL,
 "name" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "data" BYTEA NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Attachment_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Attachment_recordId_idx" ON "Attachment"("recordId");
