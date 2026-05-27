/**
 * Validates password based on UI rules:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one special character
 */
export function validatePassword(password: string): boolean {
  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|]/.test(password);

  return (
    hasMinLength &&
    hasLowercase &&
    hasUppercase &&
    hasSpecialChar
  );
}