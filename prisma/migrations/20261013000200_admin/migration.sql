ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER', ADD COLUMN "isSynthetic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD CONSTRAINT "User_role_check" CHECK ("role" IN ('USER', 'ADMIN'));
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "User_role_idx" ON "User"("role");
