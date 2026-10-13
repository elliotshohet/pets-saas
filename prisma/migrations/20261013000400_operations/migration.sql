CREATE TABLE "OperationalEvent" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "kind" TEXT NOT NULL,
 "actorId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "OperationalEvent_createdAt_idx" ON "OperationalEvent"("createdAt");
CREATE INDEX "OperationalEvent_kind_createdAt_idx" ON "OperationalEvent"("kind", "createdAt");
