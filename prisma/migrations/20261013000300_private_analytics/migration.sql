ALTER TABLE "User" ADD COLUMN "analyticsId" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX "User_analyticsId_key" ON "User"("analyticsId");
