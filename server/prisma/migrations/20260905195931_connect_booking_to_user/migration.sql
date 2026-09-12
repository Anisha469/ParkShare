-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parkingSpaceId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_parkingSpaceId_fkey" FOREIGN KEY ("parkingSpaceId") REFERENCES "ParkingSpace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "date", "id", "parkingSpaceId", "time", "userId") SELECT "createdAt", "date", "id", "parkingSpaceId", "time", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_parkingSpaceId_date_time_key" ON "Booking"("parkingSpaceId", "date", "time");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
