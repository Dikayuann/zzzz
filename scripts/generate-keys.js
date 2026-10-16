import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

// 1. Pastikan file .env ada
if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log("📄 File .env belum ditemukan. Menyalin dari .env.example...");
        fs.copyFileSync(envExamplePath, envPath);
    } else {
        fs.writeFileSync(envPath, "", "utf-8");
    }
}

let envContent = fs.readFileSync(envPath, "utf-8");

// 2. Generate secret acak (32 bytes = 64 karakter hex)
const newJwtSecret = crypto.randomBytes(32).toString("hex");
const newJwtRefreshSecret = crypto.randomBytes(32).toString("hex");
const newEncryptionKey = crypto.randomBytes(32).toString("hex");

const setOrReplaceKey = (content, key, value, onlyIfEmpty = false) => {
    const regex = new RegExp(`^${key}\\s*=.*$`, "m");
    if (regex.test(content)) {
        if (onlyIfEmpty) {
            const currentMatch = content.match(regex)[0];
            const currentValue = currentMatch.split("=")[1]?.trim().replace(/^["']|["']$/g, "");
            if (currentValue && currentValue.length >= 32) {
                return { content, updated: false, reason: "sudah terisi (aman)" };
            }
        }
        return {
            content: content.replace(regex, `${key}="${value}"`),
            updated: true,
        };
    } else {
        const separator = content.endsWith("\n") || content.length === 0 ? "" : "\n";
        return {
            content: `${content}${separator}${key}="${value}"\n`,
            updated: true,
        };
    }
};

const jwtRes = setOrReplaceKey(envContent, "JWT_SECRET", newJwtSecret, false);
envContent = jwtRes.content;

const refreshRes = setOrReplaceKey(envContent, "JWT_REFRESH_SECRET", newJwtRefreshSecret, false);
envContent = refreshRes.content;

// ENCRYPTION_KEY hanya di-generate jika masih kosong agar tidak merusak data terenkripsi yang sudah ada
const forceFlag = process.argv.includes("--force");
const encRes = setOrReplaceKey(envContent, "ENCRYPTION_KEY", newEncryptionKey, !forceFlag);
envContent = encRes.content;

fs.writeFileSync(envPath, envContent, "utf-8");

console.log("\n==================================================");
console.log("  🔐 Campaign Blast - Application Key Generator");
console.log("==================================================");
console.log(` ✅ JWT_SECRET          : Berhasil diperbarui [64-hex]`);
console.log(` ✅ JWT_REFRESH_SECRET  : Berhasil diperbarui [64-hex]`);
if (encRes.updated) {
    console.log(` ✅ ENCRYPTION_KEY      : Berhasil dibuat baru [64-hex]`);
} else {
    console.log(` 🛡️  ENCRYPTION_KEY      : Dipertahankan (${encRes.reason})`);
}
console.log("==================================================");
console.log("🎉 File .env berhasil disinkronkan seperti `php artisan key:generate`!\n");
