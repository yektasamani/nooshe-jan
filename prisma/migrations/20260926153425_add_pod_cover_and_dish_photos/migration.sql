-- CreateEnum
CREATE TYPE "DishPhotoShape" AS ENUM ('SQUARE', 'ORIGINAL');

-- AlterTable
ALTER TABLE "pods" ADD COLUMN     "coverPhotoUrl" TEXT;

-- CreateTable
CREATE TABLE "dish_photos" (
    "id" UUID NOT NULL,
    "dishId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "displayShape" "DishPhotoShape" NOT NULL DEFAULT 'SQUARE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dish_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dish_photos_dishId_idx" ON "dish_photos"("dishId");

-- AddForeignKey
ALTER TABLE "dish_photos" ADD CONSTRAINT "dish_photos_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
