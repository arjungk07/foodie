import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

const getSecretKey = () => {
  if (!process.env.OTP_ENCRYPTION_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SECURITY FATAL: OTP_ENCRYPTION_KEY must be defined in production environment!');
    }
    console.warn('[SECURITY WARNING] OTP_ENCRYPTION_KEY is missing from environment. Using development fallback key.');
    return 'dev-fallback-otp-secret-key-32b!';
  }
  return process.env.OTP_ENCRYPTION_KEY;
};

const key = Buffer.from(getSecretKey().padEnd(32).substring(0, 32));

/**
 * Encrypt a plain text OTP
 * @param {string} text - The 6-digit OTP code
 * @returns {string} iv:encrypted hex string
 */
export function encryptOTP(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('OTP Encryption failed:', err);
    return null;
  }
}

/**
 * Decrypt an encrypted OTP hex string
 * @param {string} text - iv:encrypted hex string
 * @returns {string|null} Decrypted 6-digit OTP or null if failed
 */
export function decryptOTP(text) {
  try {
    if (!text || !text.includes(':')) return null;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('OTP Decryption failed:', err);
    return null;
  }
}
