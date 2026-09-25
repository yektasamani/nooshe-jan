-- CreateTable
CREATE TABLE "dish_co_makers" (
    "dishId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "dish_co_makers_pkey" PRIMARY KEY ("dishId","userId")
);

-- AddForeignKey
ALTER TABLE "dish_co_makers" ADD CONSTRAINT "dish_co_makers_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_co_makers" ADD CONSTRAINT "dish_co_makers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
