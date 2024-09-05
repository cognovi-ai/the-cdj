/**
 * @jest-environment node
 */
import { decrypt, encrypt } from '../../src/utils/aes.js';

describe('AES tests', () => {
  const originalKey = process.env.ENCRYPTION_KEY;
  const testKey = '12345678901234567890123456789012';

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = testKey;
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  it('throws error when encryption key not set', () => {
    process.env.ENCRYPTION_KEY = '';
    expect(() => {
      encrypt('');
    }).toThrow(new Error('Encryption key is not set!'));

    expect(() => {
      decrypt('');
    }).toThrow(new Error('Encryption key is not set!'));
  });

  it('throws error with improper encryption key', () => {
    process.env.ENCRYPTION_KEY = '1234567890';
    expect(() => {
      encrypt('');
    }).toThrow(new Error('Invalid key length'));
  });

  it('encrypts and decrypts simple strings correctly', () => {
    const testPlaintext = 'Hello, World!';
    const encrypted = encrypt(testPlaintext);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(testPlaintext);
  });

  it('handles empty strings', () => {
    const testPlaintext = '';
    const encrypted = encrypt(testPlaintext);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toBe('');
    expect(decrypted).toBe(testPlaintext);
  });

  it('handles strings with special characters', () => {
    const testPlaintext = 'Thís ís å tèst strîng with spécîål chåråctèrs! @#£€%&*()_+';
    const encrypted = encrypt(testPlaintext);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(testPlaintext);
  });

  it('handles long strings', () => {
    const testPlaintext = 'a'.repeat(1000);
    const encrypted = encrypt(testPlaintext);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(testPlaintext);
  });

  it('produces different ciphertexts for the same plaintext', () => {
    const testPlaintext = 'Hello, World!';
    const encrypted1 = encrypt(testPlaintext);
    const encrypted2 = encrypt(testPlaintext);

    expect(encrypted1).not.toBe(encrypted2);
    expect(decrypt(encrypted1)).toBe(testPlaintext);
    expect(decrypt(encrypted2)).toBe(testPlaintext);
  });

  it('throws an error if decrypting with the wrong encryption key', () => {
    const testPlaintext = 'Hello, World!';
    const encrypted = encrypt(testPlaintext);

    process.env.ENCRYPTION_KEY = 'a'.repeat(32);
    expect(() => {
      decrypt(encrypted);
    }).toThrow();
  });

  it('throws an error when decrypting malformed ciphertext', () => {
    const invalidCiphertext = 'invalidCiphertext';

    expect(() => {
      decrypt(invalidCiphertext);
    }).toThrow();
  });

  it('encrypts strings with colon delimiter without error', () => {
    const testPlaintext = ':Hello, World!';
    const encrypted = encrypt(testPlaintext);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(testPlaintext);
  });
});