-- CreateTable
CREATE TABLE "BankSettings" (
    "id" TEXT NOT NULL,
    "annualSchedulePercent" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BankSettings" ("id", "annualSchedulePercent", "updatedAt")
VALUES ('global', 16, CURRENT_TIMESTAMP);
