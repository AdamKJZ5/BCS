#!/usr/bin/env node

// Test password validation
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('❌ Password must be at least 8 characters long');
  } else {
    console.log('✅ Length: 8+ characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('❌ Password must contain at least one uppercase letter');
  } else {
    console.log('✅ Has uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('❌ Password must contain at least one lowercase letter');
  } else {
    console.log('✅ Has lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('❌ Password must contain at least one number');
  } else {
    console.log('✅ Has number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('❌ Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  } else {
    console.log('✅ Has special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'Password1!', '12345678', 'qwerty123', 'admin123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password123'
  ];

  const hasCommon = commonPasswords.some(weak =>
    password.toLowerCase().includes(weak.toLowerCase())
  );

  if (hasCommon) {
    errors.push('❌ Password is too common. Please choose a more unique password');
  } else {
    console.log('✅ Not a common password');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const testPassword = process.argv[2] || 'Test123!';

console.log('\n🔐 Testing Password:', testPassword);
console.log('─'.repeat(60));

const result = validatePassword(testPassword);

console.log('\nResult:', result.valid ? '✅ VALID' : '❌ INVALID');

if (!result.valid) {
  console.log('\nErrors:');
  result.errors.forEach(err => console.log(`  ${err}`));
}

console.log('\n📋 Password Requirements:');
console.log('  • Minimum 8 characters');
console.log('  • At least 1 uppercase letter (A-Z)');
console.log('  • At least 1 lowercase letter (a-z)');
console.log('  • At least 1 number (0-9)');
console.log('  • At least 1 special character (!@#$%^&*etc)');
console.log('  • Cannot contain common passwords');
console.log('\n✅ Good examples: MySecret#2026, StrongP@ss99, Secure$Pass2026');
console.log('❌ Bad examples: Password1!, password123, Test1234!');
console.log('');
