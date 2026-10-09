-- AlterTable
ALTER TABLE `tenants` ADD COLUMN `telegramBotId` INTEGER NULL;

-- CreateTable
CREATE TABLE `telegram_bots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `bot_token` VARCHAR(255) NOT NULL,
    `bot_username` VARCHAR(100) NULL,
    `bot_name` VARCHAR(100) NULL,
    `target_chat_id` VARCHAR(100) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    `connected_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `telegram_bots_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `telegram_bots` ADD CONSTRAINT `telegram_bots_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
