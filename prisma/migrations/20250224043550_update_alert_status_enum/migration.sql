-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlertMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT
);
INSERT INTO "new_AlertMessage" ("alertType", "createdAt", "errorMessage", "id", "message", "shopId", "status") SELECT "alertType", "createdAt", "errorMessage", "id", "message", "shopId", "status" FROM "AlertMessage";
DROP TABLE "AlertMessage";
ALTER TABLE "new_AlertMessage" RENAME TO "AlertMessage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
