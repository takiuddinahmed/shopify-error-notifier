-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Configuration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "productCreate" BOOLEAN NOT NULL DEFAULT false,
    "productUpdate" BOOLEAN NOT NULL DEFAULT false,
    "productDelete" BOOLEAN NOT NULL DEFAULT false,
    "signup" BOOLEAN NOT NULL DEFAULT false,
    "signin" BOOLEAN NOT NULL DEFAULT false,
    "customersDelete" BOOLEAN NOT NULL DEFAULT false,
    "customersRedact" BOOLEAN NOT NULL DEFAULT false,
    "checkout" BOOLEAN NOT NULL DEFAULT false,
    "ordersUpdated" BOOLEAN NOT NULL DEFAULT false,
    "ordersCancelled" BOOLEAN NOT NULL DEFAULT false,
    "ordersFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "checkoutsCreate" BOOLEAN NOT NULL DEFAULT false,
    "checkoutsUpdate" BOOLEAN NOT NULL DEFAULT false,
    "inventoryUpdate" BOOLEAN NOT NULL DEFAULT false,
    "themesCreate" BOOLEAN NOT NULL DEFAULT false,
    "themesUpdate" BOOLEAN NOT NULL DEFAULT false,
    "themesDelete" BOOLEAN NOT NULL DEFAULT false,
    "themesPublish" BOOLEAN NOT NULL DEFAULT false,
    "shopUpdate" BOOLEAN NOT NULL DEFAULT false,
    "systemIssue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Configuration" ("checkout", "createdAt", "id", "productCreate", "productDelete", "productUpdate", "shopId", "signin", "signup", "systemIssue", "updatedAt") SELECT "checkout", "createdAt", "id", "productCreate", "productDelete", "productUpdate", "shopId", "signin", "signup", "systemIssue", "updatedAt" FROM "Configuration";
DROP TABLE "Configuration";
ALTER TABLE "new_Configuration" RENAME TO "Configuration";
CREATE UNIQUE INDEX "Configuration_shopId_key" ON "Configuration"("shopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
