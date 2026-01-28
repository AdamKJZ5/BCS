/**
 * Password validation utility
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password) {
    return {
      valid: false,
      errors: ['Password is required'],
    };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'Password1!', '12345678', 'qwerty123', 'admin123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password123'
  ];

  if (commonPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate password strength score (0-100)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;

  if (!password) return 0;

  // Length bonus
  strength += Math.min(password.length * 4, 40);

  // Character variety bonuses
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

  // Additional variety bonuses
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 5;
  if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength += 5;

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) strength -= 10; // Repeated characters
  if (/^[a-zA-Z]+$/.test(password)) strength -= 10; // Only letters
  if (/^[0-9]+$/.test(password)) strength -= 10; // Only numbers

  return Math.max(0, Math.min(100, strength));
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (score: number): string => {
  if (score < 40) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Good';
  return 'Strong';
};
