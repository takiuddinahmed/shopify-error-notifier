/*
  Warnings:

  - You are about to drop the column `shop` on the `AlertMessage` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ReceiverConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `is_email_enabled` on the `ReceiverConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `is_telegram_enabled` on the `ReceiverConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `shop` on the `ReceiverConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_bot_token` on the `ReceiverConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_chat_id` on the `ReceiverConfiguration` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `AlertMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `ReceiverConfiguration` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlertMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Success',
    "errorMessage" TEXT
);
INSERT INTO "new_AlertMessage" ("alertType", "createdAt", "errorMessage", "id", "message", "status") SELECT "alertType", "createdAt", "errorMessage", "id", "message", "status" FROM "AlertMessage";
DROP TABLE "AlertMessage";
ALTER TABLE "new_AlertMessage" RENAME TO "AlertMessage";
CREATE TABLE "new_ReceiverConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "isTelegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramReceiverChatIds" TEXT,
    "telegramBotToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ReceiverConfiguration" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "ReceiverConfiguration";
DROP TABLE "ReceiverConfiguration";
ALTER TABLE "new_ReceiverConfiguration" RENAME TO "ReceiverConfiguration";
CREATE UNIQUE INDEX "ReceiverConfiguration_shopId_key" ON "ReceiverConfiguration"("shopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
