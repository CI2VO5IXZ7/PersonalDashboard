-- CreateEnum
CREATE TYPE "MailFolder" AS ENUM ('inbox', 'sent', 'draft', 'spam', 'archived');

-- CreateEnum
CREATE TYPE "DecisionSourceType" AS ENUM ('mail', 'subscription', 'ticktick_task', 'ticktick_event', 'manual');

-- CreateEnum
CREATE TYPE "DecisionPriority" AS ENUM ('urgent', 'important', 'normal');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('pending', 'converted', 'dismissed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "locale" TEXT NOT NULL DEFAULT 'zh-CN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folder" "MailFolder" NOT NULL DEFAULT 'inbox',
    "subject" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'tech',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "sourceUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" "DecisionSourceType" NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "priority" "DecisionPriority" NOT NULL DEFAULT 'normal',
    "status" "DecisionStatus" NOT NULL DEFAULT 'pending',
    "suggestedAction" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "senderInitials" TEXT,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DecisionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TickTickConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TickTickConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "locale" TEXT NOT NULL DEFAULT 'zh-CN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "securityMode" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DockItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'module',
    "title" TEXT NOT NULL,
    "iconType" TEXT NOT NULL DEFAULT 'lucide',
    "iconValue" TEXT NOT NULL,
    "targetPath" TEXT,
    "targetUrl" TEXT,
    "openMode" TEXT NOT NULL DEFAULT 'internal',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconType" TEXT NOT NULL DEFAULT 'lucide',
    "iconValue" TEXT NOT NULL DEFAULT 'bookmark',
    "openMode" TEXT NOT NULL DEFAULT 'newTab',
    "isPinnedToDock" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "MailItem_userId_folder_idx" ON "MailItem"("userId", "folder");

-- CreateIndex
CREATE INDEX "MailItem_userId_isRead_idx" ON "MailItem"("userId", "isRead");

-- CreateIndex
CREATE INDEX "SubscriptionItem_userId_category_idx" ON "SubscriptionItem"("userId", "category");

-- CreateIndex
CREATE INDEX "SubscriptionItem_userId_isRead_idx" ON "SubscriptionItem"("userId", "isRead");

-- CreateIndex
CREATE INDEX "DecisionItem_userId_status_idx" ON "DecisionItem"("userId", "status");

-- CreateIndex
CREATE INDEX "DecisionItem_userId_priority_idx" ON "DecisionItem"("userId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "TickTickConnection_userId_key" ON "TickTickConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE INDEX "DockItem_userId_sortOrder_idx" ON "DockItem"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_isPinnedToDock_idx" ON "Bookmark"("userId", "isPinnedToDock");

-- AddForeignKey
ALTER TABLE "MailItem" ADD CONSTRAINT "MailItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionItem" ADD CONSTRAINT "DecisionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TickTickConnection" ADD CONSTRAINT "TickTickConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DockItem" ADD CONSTRAINT "DockItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
