export const JWT_SECRET =
    process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== ""
        ? process.env.JWT_SECRET.trim()
        : "dev_secret_key_change_in_production_campaign_blast_2026";
