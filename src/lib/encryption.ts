import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes recommended for AES-GCM

/**
 * Mendapatkan buffer 32-byte key dari environment variable ENCRYPTION_KEY.
 * Jika key berupa 64 hex string, diubah menjadi 32 bytes Buffer.
 * Jika berupa string biasa, di-hash dengan SHA-256 agar selalu valid 32 bytes.
 */
function getEncryptionKey(): Buffer {
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey) {
        // Fallback default dev key jika belum ada di .env (dengan warning)
        console.warn("[SECURITY]: ENCRYPTION_KEY tidak ditemukan di environment. Menggunakan fallback developer key.");
        return crypto.createHash("sha256").update("campaign_blast_dev_fallback_key_2026").digest();
    }

    if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
        return Buffer.from(rawKey, "hex");
    }

    return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Enkripsi string teks biasa menjadi format hex terserialisasi:
 * `iv:authTag:ciphertext`
 */
export function encrypt(plaintext: string): string {
    if (!plaintext || plaintext.trim().length === 0) {
        return "";
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Dekripsi format hex terserialisasi (`iv:authTag:ciphertext`) kembali ke teks asli.
 * Memiliki backward-compatibility fallback jika string belum terenkripsi (teks warisan / legacy).
 */
export function decrypt(ciphertextWithMetadata: string): string {
    if (!ciphertextWithMetadata || ciphertextWithMetadata.trim().length === 0) {
        return "";
    }

    const parts = ciphertextWithMetadata.split(":");
    // Jika tidak memiliki 3 segmen (iv : authTag : ciphertext), kembalikan teks aslinya (fallback legacy)
    if (parts.length !== 3) {
        return ciphertextWithMetadata;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    // Validasi apakah segmen sesuai format hex yang valid
    if (
        !/^[0-9a-fA-F]+$/.test(ivHex) ||
        !/^[0-9a-fA-F]+$/.test(authTagHex) ||
        (encryptedHex.length > 0 && !/^[0-9a-fA-F]+$/.test(encryptedHex))
    ) {
        return ciphertextWithMetadata;
    }

    try {
        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        // Jika dekripsi gagal (misal data korup atau kunci berbeda), kembalikan raw value agar tidak crash
        console.error("[Decryption Error]: Gagal mendekripsi data rahasia. Mengembalikan nilai mentah:", err);
        return ciphertextWithMetadata;
    }
}
