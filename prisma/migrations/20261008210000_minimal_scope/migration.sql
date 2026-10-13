ALTER TABLE "Pet" DROP COLUMN "concerns", DROP COLUMN "questions";
ALTER TABLE "MedicalRecord"
  DROP COLUMN "observations", DROP COLUMN "vaccineProduct", DROP COLUMN "vaccineLot",
  DROP COLUMN "vaccineRoute", DROP COLUMN "vaccineDueDate", DROP COLUMN "vaccineCertificate",
  DROP COLUMN "veterinarian", DROP COLUMN "vaccineName";
