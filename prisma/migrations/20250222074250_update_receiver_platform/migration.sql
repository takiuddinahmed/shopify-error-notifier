-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiverConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "receiverPlatform" TEXT NOT NULL,
    "telegramReceiverChatIds" TEXT,
    "telegramBotToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ReceiverConfiguration" ("createdAt", "id", "receiverPlatform", "shopId", "telegramBotToken", "telegramReceiverChatIds", "updatedAt") SELECT "createdAt", "id", "receiverPlatform", "shopId", "telegramBotToken", "telegramReceiverChatIds", "updatedAt" FROM "ReceiverConfiguration";
DROP TABLE "ReceiverConfiguration";
ALTER TABLE "new_ReceiverConfiguration" RENAME TO "ReceiverConfiguration";
CREATE UNIQUE INDEX "ReceiverConfiguration_shopId_key" ON "ReceiverConfiguration"("shopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
