-- CreateEnum
CREATE TYPE "RatingTier" AS ENUM ('LIKED', 'OKAY', 'DISLIKED');

-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "tier" "RatingTier" NOT NULL DEFAULT 'OKAY';
