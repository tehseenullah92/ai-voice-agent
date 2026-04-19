-- AlterTable
ALTER TABLE `Workspace` ADD COLUMN `twilioIncomingNumbers` JSON NULL;

-- AlterTable
ALTER TABLE `Campaign` ADD COLUMN `fromPhoneNumber` VARCHAR(191) NULL;
