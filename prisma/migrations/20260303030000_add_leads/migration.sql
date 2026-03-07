CREATE TABLE `Lead` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NULL,
  `campaignId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `campaign` VARCHAR(191) NULL,
  `project` VARCHAR(191) NULL,
  `interest` ENUM('hot', 'warm', 'cold') NOT NULL,
  `status` ENUM('new', 'follow_up', 'converted', 'dead') NOT NULL DEFAULT 'new',
  `assignedTo` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `Lead_userId_idx` (`userId`),
  INDEX `Lead_campaignId_idx` (`campaignId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Lead`
  ADD CONSTRAINT `Lead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Lead_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Lead_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

