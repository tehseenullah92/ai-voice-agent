CREATE TABLE `Call` (
  `id` VARCHAR(191) NOT NULL,
  `campaignId` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NULL,
  `clientName` VARCHAR(191) NULL,
  `clientPhone` VARCHAR(191) NOT NULL,
  `status` ENUM('pending', 'in_progress', 'completed', 'failed', 'no_answer') NOT NULL DEFAULT 'pending',
  `duration` INT NULL,
  `outcome` VARCHAR(191) NULL,
  `notes` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,

  INDEX `Call_campaignId_idx` (`campaignId`),
  INDEX `Call_status_idx` (`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Call`
  ADD CONSTRAINT `Call_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
