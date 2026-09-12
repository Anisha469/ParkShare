/*
  Warnings:

  - A unique constraint covering the columns `[parkingSpaceId,date,time]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Booking_parkingSpaceId_date_time_key" ON "Booking"("parkingSpaceId", "date", "time");
