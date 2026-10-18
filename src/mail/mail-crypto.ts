import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function getKey(): Buffer {
  const secret = process.env.MAIL_CRYPTO_KEY || process.env.DB_PASS || 'sistema-pia-secret-key-32-chars!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encripta una contraseña o token
 * Devuelve formato 'ivHex:encryptedHex'
 */
export function encryptPassword(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Desencripta una contraseña o token.
 * Si el texto no viene en formato encriptado (ej. texto plano insertado manualmente),
 * devuelve el texto original sin fallar.
 */
export function decryptPassword(text: string): string {
  if (!text) return text;
  const parts = text.split(':');
  if (parts.length !== 2 || parts[0].length !== 32) {
    // Si no coincide con el formato hex IV:Cipher, asumimos texto plano
    return text;
  }
  try {
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    // Si falla la desencripción, retornar texto original como fallback
    return text;
  }
}
