const crypto = require("crypto");

const SECRET_KEY = "9fJx3Tqz2LWBvRYKp8NMdhCG65ZPVA0Q";
const SECRET_IV = "B2X7F9MZL1VQKH3J";

function decryptEnv(encryptedText) {
  try {
    const key = Buffer.from(SECRET_KEY, "utf-8").slice(0, 32);
    const iv = Buffer.from(SECRET_IV, "utf-8").slice(0, 16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "base64", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
  } catch (error) {
    console.error("❌ Error al descifrar:", error.message);
    return null;
  }
}

const encryptedText = "a+WDknqDgjgXiZlhTO+f4g==";
const decryptedText = decryptEnv(encryptedText);

console.log("🔓 Texto desencriptado:", decryptedText);
