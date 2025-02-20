-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "productCreate" BOOLEAN NOT NULL DEFAULT false,
    "productUpdate" BOOLEAN NOT NULL DEFAULT false,
    "productDelete" BOOLEAN NOT NULL DEFAULT false,
    "signup" BOOLEAN NOT NULL DEFAULT false,
    "signin" BOOLEAN NOT NULL DEFAULT false,
    "checkout" BOOLEAN NOT NULL DEFAULT false,
    "systemIssue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReceiverConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "is_telegram_enabled" BOOLEAN NOT NULL DEFAULT false,
    "telegram_chat_id" TEXT,
    "telegram_bot_token" TEXT,
    "is_email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlertMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Success',
    "errorMessage" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_shopId_key" ON "Configuration"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiverConfiguration_shop_key" ON "ReceiverConfiguration"("shop");
