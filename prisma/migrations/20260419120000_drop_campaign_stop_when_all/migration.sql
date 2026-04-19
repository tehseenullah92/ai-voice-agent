-- Drop optional auto-complete flag; campaigns always complete when all contacts finish.
ALTER TABLE `Campaign` DROP COLUMN `stopWhenAllReached`;
