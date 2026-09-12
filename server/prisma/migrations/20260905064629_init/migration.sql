-- CreateTable
CREATE TABLE "ParkingSpace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "pricePerHour" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parkingSpaceId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_parkingSpaceId_fkey" FOREIGN KEY ("parkingSpaceId") REFERENCES "ParkingSpace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
