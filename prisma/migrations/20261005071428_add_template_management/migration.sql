/*
  Warnings:

  - You are about to drop the column `content` on the `template_versions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `template_versions` table. All the data in the column will be lost.
  - You are about to drop the column `design_config_json` on the `template_versions` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `template_versions` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `current_version` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `templates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[template_id,version_no]` on the table `template_versions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `template_versions` DROP FOREIGN KEY `template_versions_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `template_versions` DROP FOREIGN KEY `template_versions_template_id_fkey`;

-- DropForeignKey
ALTER TABLE `templates` DROP FOREIGN KEY `templates_tenant_id_fkey`;

-- DropIndex
DROP INDEX `template_versions_created_by_id_fkey` ON `template_versions`;

-- DropIndex
DROP INDEX `uq_template_version` ON `template_versions`;

-- DropIndex
DROP INDEX `idx_templates_tenant_channel` ON `templates`;

-- AlterTable
ALTER TABLE `template_versions` DROP COLUMN `content`,
    DROP COLUMN `created_by_id`,
    DROP COLUMN `design_config_json`,
    DROP COLUMN `version`,
    ADD COLUMN `content_html` TEXT NULL,
    ADD COLUMN `content_json` JSON NULL,
    ADD COLUMN `content_telegram` TEXT NULL,
    ADD COLUMN `content_whatsapp` TEXT NULL,
    ADD COLUMN `created_by` INTEGER NULL,
    ADD COLUMN `language` VARCHAR(20) NULL DEFAULT 'id',
    ADD COLUMN `last_sync_at` DATETIME(3) NULL,
    ADD COLUMN `meta_template_id` VARCHAR(255) NULL,
    ADD COLUMN `rejected_reason` TEXT NULL,
    ADD COLUMN `version_no` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `whatsapp_approval_status` VARCHAR(50) NULL DEFAULT 'draft',
    ADD COLUMN `whatsapp_category` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `templates` DROP COLUMN `channel`,
    DROP COLUMN `current_version`,
    DROP COLUMN `description`,
    ADD COLUMN `channel_mode` VARCHAR(50) NOT NULL DEFAULT 'email',
    ALTER COLUMN `category` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `idx_template_meta_id` ON `template_versions`(`meta_template_id`);

-- CreateIndex
CREATE UNIQUE INDEX `uq_template_version` ON `template_versions`(`template_id`, `version_no`);

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `templates_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_versions` ADD CONSTRAINT `template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_versions` ADD CONSTRAINT `template_versions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
