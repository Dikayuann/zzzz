/*
  Warnings:

  - You are about to drop the column `actor_user_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `metadata_json` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `password_resets` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `entity_type` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_tenant_id_fkey`;

-- DropIndex
DROP INDEX `audit_logs_tenant_id_fkey` ON `audit_logs`;

-- AlterTable
ALTER TABLE `audit_logs` DROP COLUMN `actor_user_id`,
    DROP COLUMN `entity`,
    DROP COLUMN `metadata_json`,
    ADD COLUMN `actor_id` INTEGER NULL,
    ADD COLUMN `details` JSON NULL,
    ADD COLUMN `entity_type` VARCHAR(100) NOT NULL,
    MODIFY `tenant_id` INTEGER NULL,
    MODIFY `action` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `password_resets` DROP COLUMN `create_at`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `expires_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` DROP COLUMN `create_at`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `expires_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_module_action_key`(`module`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
