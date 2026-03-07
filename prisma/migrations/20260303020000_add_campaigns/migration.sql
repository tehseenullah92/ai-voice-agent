CREATE TABLE `Campaign` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `project` VARCHAR(191) NOT NULL,
  `language` VARCHAR(191) NOT NULL,
  `concurrency` INT NOT NULL DEFAULT 1,
  `clientListKey` VARCHAR(191) NULL,
  `voiceId` VARCHAR(191) NULL,
  `greeting` TEXT NULL,
  `prompt` TEXT NULL,
  `maxRetries` INT NOT NULL DEFAULT 0,
  `callStart` VARCHAR(191) NULL,
  `callEnd` VARCHAR(191) NULL,
  `totalClients` INT NOT NULL DEFAULT 0,
  `called` INT NOT NULL DEFAULT 0,
  `remaining` INT NOT NULL DEFAULT 0,
  `interested` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'active', 'paused', 'completed') NOT NULL DEFAULT 'draft',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `Campaign_userId_idx` (`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CampaignClientList` (
  `id` VARCHAR(191) NOT NULL,
  `campaignId` VARCHAR(191) NOT NULL,
  `clientListId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `CampaignClientList_campaignId_clientListId_key` (`campaignId`, `clientListId`),
  INDEX `CampaignClientList_clientListId_idx` (`clientListId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Campaign`
  ADD CONSTRAINT `Campaign_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CampaignClientList`
  ADD CONSTRAINT `CampaignClientList_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CampaignClientList_clientListId_fkey` FOREIGN KEY (`clientListId`) REFERENCES `ClientList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

