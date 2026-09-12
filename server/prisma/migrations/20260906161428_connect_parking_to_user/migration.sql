-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ParkingSpace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "pricePerHour" INTEGER NOT NULL,
    "ownerId" INTEGER,
    CONSTRAINT "ParkingSpace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ParkingSpace" ("id", "location", "ownerId", "pricePerHour", "title") SELECT "id", "location", "ownerId", "pricePerHour", "title" FROM "ParkingSpace";
DROP TABLE "ParkingSpace";
ALTER TABLE "new_ParkingSpace" RENAME TO "ParkingSpace";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
