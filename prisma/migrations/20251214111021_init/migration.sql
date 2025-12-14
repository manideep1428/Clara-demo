-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "workosId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_workosId_key" ON "User"("workosId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
