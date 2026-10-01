-- CreateTable
CREATE TABLE "dish_likes" (
    "dishId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dish_likes_pkey" PRIMARY KEY ("dishId","userId")
);

-- CreateTable
CREATE TABLE "dish_comments" (
    "id" UUID NOT NULL,
    "dishId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dish_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "want_to_try_likes" (
    "wantToTryId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "want_to_try_likes_pkey" PRIMARY KEY ("wantToTryId","userId")
);

-- CreateTable
CREATE TABLE "want_to_try_comments" (
    "id" UUID NOT NULL,
    "wantToTryId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "want_to_try_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dish_comments_dishId_idx" ON "dish_comments"("dishId");

-- CreateIndex
CREATE INDEX "want_to_try_comments_wantToTryId_idx" ON "want_to_try_comments"("wantToTryId");

-- AddForeignKey
ALTER TABLE "dish_likes" ADD CONSTRAINT "dish_likes_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_likes" ADD CONSTRAINT "dish_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_comments" ADD CONSTRAINT "dish_comments_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_comments" ADD CONSTRAINT "dish_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_try_likes" ADD CONSTRAINT "want_to_try_likes_wantToTryId_fkey" FOREIGN KEY ("wantToTryId") REFERENCES "want_to_trys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_try_likes" ADD CONSTRAINT "want_to_try_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_try_comments" ADD CONSTRAINT "want_to_try_comments_wantToTryId_fkey" FOREIGN KEY ("wantToTryId") REFERENCES "want_to_trys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_try_comments" ADD CONSTRAINT "want_to_try_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
