/*
  Warnings:

  - You are about to drop the column `isCustom` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tenants` table. All the data in the column will be lost.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `users` table. All the data in the column will be lost.
  - Added the required column `role_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `roles_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_userId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_tenantId_fkey`;

-- DropIndex
DROP INDEX `roles_tenantId_fkey` ON `roles`;

-- DropIndex
DROP INDEX `user_roles_roleId_fkey` ON `user_roles`;

-- DropIndex
DROP INDEX `users_tenantId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `roles` DROP COLUMN `isCustom`,
    DROP COLUMN `tenantId`,
    ADD COLUMN `is_custom` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tenant_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `tenants` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user_roles` DROP PRIMARY KEY,
    DROP COLUMN `roleId`,
    DROP COLUMN `userId`,
    ADD COLUMN `role_id` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `role_id`);

-- AlterTable
ALTER TABLE `users` DROP COLUMN `lastLoginAt`,
    DROP COLUMN `mfaEnabled`,
    DROP COLUMN `passwordHash`,
    DROP COLUMN `tenantId`,
    ADD COLUMN `last_login_at` DATETIME(3) NULL,
    ADD COLUMN `mfa_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `password_hash` VARCHAR(255) NOT NULL,
    ADD COLUMN `tenant_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
