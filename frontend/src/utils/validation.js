/**
 * validation.js — Shared Input Validation Utilities
 */

const BLOCKED_DOMAINS = [
  'test.com',
  'fake.com',
  'tempmail.com',
  'throwaway.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'asdf.com',
  'xyz.com',
  'abc.com',
];

export function validateEmailQuality(email) {
  const normalized = (email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  const domain = normalized.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: `Disposable and test domains (@${domain}) are not allowed. Please use an authentic email address.`,
    };
  }

  return { valid: true, domain };
}

export function validatePasswordStrength(password) {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}
