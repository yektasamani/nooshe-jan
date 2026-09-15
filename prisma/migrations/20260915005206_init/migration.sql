-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "privateByDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuisines" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" UUID,
    "isSeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuisines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pod_members" (
    "podId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "pod_members_pkey" PRIMARY KEY ("podId","userId")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "cuisineId" UUID NOT NULL,
    "makerId" UUID NOT NULL,
    "notes" TEXT,
    "recipeUrl" TEXT,
    "recipeAttachment" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "cookDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_eaters" (
    "dishId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "dish_eaters_pkey" PRIMARY KEY ("dishId","userId")
);

-- CreateTable
CREATE TABLE "dish_tags" (
    "dishId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "dish_tags_pkey" PRIMARY KEY ("dishId","tagId")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dishId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairwise_comparisons" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dishAId" UUID NOT NULL,
    "dishBId" UUID NOT NULL,
    "winnerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pairwise_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "want_to_trys" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "link" TEXT,
    "addedById" UUID NOT NULL,
    "podId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedToDishId" UUID,

    CONSTRAINT "want_to_trys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cuisines_name_parentId_key" ON "cuisines"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "dishes_makerId_idx" ON "dishes"("makerId");

-- CreateIndex
CREATE INDEX "dishes_cuisineId_idx" ON "dishes"("cuisineId");

-- CreateIndex
CREATE INDEX "ratings_userId_position_idx" ON "ratings"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_dishId_key" ON "ratings"("userId", "dishId");

-- CreateIndex
CREATE INDEX "pairwise_comparisons_userId_idx" ON "pairwise_comparisons"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "want_to_trys_convertedToDishId_key" ON "want_to_trys"("convertedToDishId");

-- AddForeignKey
ALTER TABLE "cuisines" ADD CONSTRAINT "cuisines_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cuisines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_members" ADD CONSTRAINT "pod_members_podId_fkey" FOREIGN KEY ("podId") REFERENCES "pods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_members" ADD CONSTRAINT "pod_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_cuisineId_fkey" FOREIGN KEY ("cuisineId") REFERENCES "cuisines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_eaters" ADD CONSTRAINT "dish_eaters_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_eaters" ADD CONSTRAINT "dish_eaters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_tags" ADD CONSTRAINT "dish_tags_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_tags" ADD CONSTRAINT "dish_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairwise_comparisons" ADD CONSTRAINT "pairwise_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairwise_comparisons" ADD CONSTRAINT "pairwise_comparisons_dishAId_fkey" FOREIGN KEY ("dishAId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairwise_comparisons" ADD CONSTRAINT "pairwise_comparisons_dishBId_fkey" FOREIGN KEY ("dishBId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairwise_comparisons" ADD CONSTRAINT "pairwise_comparisons_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_trys" ADD CONSTRAINT "want_to_trys_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_trys" ADD CONSTRAINT "want_to_trys_podId_fkey" FOREIGN KEY ("podId") REFERENCES "pods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_trys" ADD CONSTRAINT "want_to_trys_convertedToDishId_fkey" FOREIGN KEY ("convertedToDishId") REFERENCES "dishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
