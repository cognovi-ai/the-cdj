/**
 * AES encryption/decryption.
 */

import crypto from 'crypto';
import 'dotenv/config';

const IV_LENGTH = 16;

export function encrypt(text: string) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('Encryption key is not set!');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('Encryption key is not set!');
  }

  const textParts: string[] = text.split(':');
  const iv = Buffer.from(textParts.shift() || '', 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
