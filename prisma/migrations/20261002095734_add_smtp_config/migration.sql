-- CreateTable
CREATE TABLE `smtp_configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 587,
    `username` VARCHAR(255) NOT NULL,
    `password_encrypted` VARCHAR(255) NOT NULL,
    `from_name` VARCHAR(255) NULL,
    `from_email` VARCHAR(255) NULL,
    `encryption` VARCHAR(50) NOT NULL DEFAULT 'TLS',
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `smtp_configs_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `smtp_configs` ADD CONSTRAINT `smtp_configs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
