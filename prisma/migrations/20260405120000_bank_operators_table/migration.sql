-- Операторы банка: таблица bank_operators (бывш. User), ФИО отдельными полями

ALTER TABLE "User" RENAME TO "bank_operators";

ALTER TABLE "bank_operators" RENAME CONSTRAINT "User_pkey" TO "bank_operators_pkey";

ALTER INDEX "User_email_key" RENAME TO "bank_operators_email_key";

ALTER TABLE "bank_operators" ADD COLUMN "lastName" TEXT;
ALTER TABLE "bank_operators" ADD COLUMN "firstName" TEXT;
ALTER TABLE "bank_operators" ADD COLUMN "patronymic" TEXT;

UPDATE "bank_operators" SET "lastName" = "name", "firstName" = '', "patronymic" = NULL;

ALTER TABLE "bank_operators" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "bank_operators" ALTER COLUMN "firstName" SET NOT NULL;

ALTER TABLE "bank_operators" DROP COLUMN "name";
