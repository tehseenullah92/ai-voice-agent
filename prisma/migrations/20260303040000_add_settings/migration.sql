CREATE TABLE `CompanySetting` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `companyName` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `callStart` VARCHAR(191) NULL,
  `callEnd` VARCHAR(191) NULL,
  `notifyNewLead` BOOLEAN NOT NULL DEFAULT TRUE,
  `notifyAppointment` BOOLEAN NOT NULL DEFAULT TRUE,
  `notifyCampaignDone` BOOLEAN NOT NULL DEFAULT FALSE,
  `notifyDailySummary` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `CompanySetting_userId_key` (`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TeamMember` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `TeamMember_userId_idx` (`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CompanySetting`
  ADD CONSTRAINT `CompanySetting_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `TeamMember`
  ADD CONSTRAINT `TeamMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

