DROP TABLE "Attachment";
DROP INDEX "MedicalRecord_followUpDate_idx";
ALTER TABLE "MedicalRecord" DROP COLUMN "followUpDate", DROP COLUMN "followUpCompletedAt";
