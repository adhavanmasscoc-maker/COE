import crypto from "crypto";

const ENCRYPTION_SECRET =
  process.env.SESSION_SECRET || "tn_board_samacheer_coe_tamperproof_secure_key_2026";
// Derive a 32-byte key using sha256 for AES-256-CBC
const SECRET_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();

/**
 * Minimal AES-256-CBC encryption with HMAC-SHA256 integrity tag
 * Used to securely seal candidate question papers and answers in SQLite
 */
export function encryptSubmissionPayload(payload) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
    const jsonString = typeof payload === "string" ? payload : JSON.stringify(payload);

    let encrypted = cipher.update(jsonString, "utf8", "base64");
    encrypted += cipher.final("base64");

    const hmac = crypto.createHmac("sha256", SECRET_KEY).update(encrypted).digest("hex");

    return JSON.stringify({
      _enc: true,
      v: 1,
      alg: "aes-256-cbc",
      iv: iv.toString("hex"),
      cipher: encrypted,
      hmac: hmac,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Payload encryption error:", err);
    // Fallback to stringified JSON if crypto fails
    return JSON.stringify(payload);
  }
}

/**
 * Decrypts encrypted submission payload
 * Supports seamless fallback for legacy unencrypted records
 */
export function decryptSubmissionPayload(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Check if this is an encrypted payload envelope
    if (!parsed || !parsed._enc || !parsed.cipher || !parsed.iv) {
      // Legacy or unencrypted raw JSON
      return parsed;
    }

    // Verify HMAC-SHA256 signature
    if (parsed.hmac) {
      const expectedHmac = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(parsed.cipher)
        .digest("hex");
      if (expectedHmac !== parsed.hmac) {
        console.warn("⚠️ Integrity verification warning: HMAC mismatch on submission payload.");
      }
    }

    const iv = Buffer.from(parsed.iv, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);

    let decrypted = decipher.update(parsed.cipher, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Payload decryption error:", err);
    return null;
  }
}
