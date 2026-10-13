-- CreateTable
CREATE TABLE `whatsapp_qr_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    `phone_number` VARCHAR(50) NULL,
    `push_name` VARCHAR(100) NULL,
    `qr_raw` TEXT NULL,
    `connected_at` DATETIME(3) NULL,
    `last_active_at` DATETIME(3) NULL,
    `daily_count` INTEGER NOT NULL DEFAULT 0,
    `daily_quota` INTEGER NOT NULL DEFAULT 300,
    `last_message_sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `whatsapp_qr_sessions_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_business_configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `phone_number_id` VARCHAR(100) NOT NULL,
    `waba_id` VARCHAR(100) NOT NULL,
    `access_token` VARCHAR(500) NOT NULL,
    `display_phone_number` VARCHAR(50) NULL,
    `messaging_tier` VARCHAR(50) NOT NULL DEFAULT 'TIER_1K',
    `quality_rating` VARCHAR(50) NOT NULL DEFAULT 'GREEN',
    `status` VARCHAR(50) NOT NULL DEFAULT 'connected',
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `whatsapp_business_configs_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `whatsapp_qr_sessions` ADD CONSTRAINT `whatsapp_qr_sessions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_business_configs` ADD CONSTRAINT `whatsapp_business_configs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
