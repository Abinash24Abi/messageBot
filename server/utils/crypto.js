import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

const SECRET_KEY = process.env.CRYPTO_SECRET || 'mysecretkey'; 
const IV_LENGTH = 16; 

export const encrypt = (text) => {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error.message);
    return text; 
  }
};

export const decrypt = (text) => {
  if (!text) return '';
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
     
      return text;
    }
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return text; 
  }
};
