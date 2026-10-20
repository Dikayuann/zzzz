-- Ubah batas harian WhatsApp QR dari 300 menjadi 35 (anti-ban)
ALTER TABLE `whatsapp_qr_sessions` MODIFY `daily_quota` INTEGER NOT NULL DEFAULT 35;

-- Sinkronkan data lama yang masih memakai default 300
UPDATE `whatsapp_qr_sessions` SET `daily_quota` = 35 WHERE `daily_quota` = 300;
