import { validatePassword } from './passwordValidator';

export function generatePassword(length = 8): string {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }

  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-={}[]:;<>,.?';

  const allChars = upper + lower + digits + special;

  let password = '';

  // ✅ Ensure required characters
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // ✅ Fill remaining length
  while (password.length < length) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // ✅ Shuffle characters
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  // ✅ Final validation safety check
  if (!validatePassword(password)) {
    throw new Error(`Generated password failed validation: ${password}`);
  }

  return password;
}