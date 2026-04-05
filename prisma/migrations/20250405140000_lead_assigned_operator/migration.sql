-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "assignedOperatorId" TEXT;

-- CreateIndex
CREATE INDEX "Lead_assignedOperatorId_idx" ON "Lead"("assignedOperatorId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedOperatorId_fkey" FOREIGN KEY ("assignedOperatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
