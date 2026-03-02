#!/usr/bin/env node

/**
 * Script to create an admin user
 *
 * Usage:
 *   node create-admin.js
 *
 * Or directly provide values:
 *   node create-admin.js "Admin Name" "admin@example.com" "555-1234" "SecurePass#2026"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Load environment variables
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI not found in .env file');
  process.exit(1);
}

// Define User Schema inline (same as User.ts)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  needsPasswordSetup: {
    type: Boolean,
    default: false,
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin(name, email, phone, password) {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error(`❌ Error: User with email ${email} already exists`);
      if (existingUser.role === 'admin') {
        console.log('   This user is already an admin.');
      } else {
        console.log('   To make this user an admin, update the role manually in the database.');
      }
      process.exit(1);
    }

    // Create admin user
    const adminUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'admin',
      needsPasswordSetup: false,
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Name:  ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phone}`);
    console.log(`   Role:  admin`);
    console.log('\n🔐 Login at: http://localhost:5137/admin/login\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  }
}

async function main() {
  console.log('🔧 Admin User Creation Tool\n');
  console.log('════════════════════════════════════════\n');

  // Check if arguments were provided
  const args = process.argv.slice(2);

  let name, email, phone, password;

  if (args.length >= 4) {
    // Use command line arguments
    [name, email, phone, password] = args;
  } else {
    // Interactive mode
    console.log('Please provide the following information:\n');

    name = await question('Full Name: ');
    if (!name || name.trim() === '') {
      console.error('❌ Error: Name is required');
      rl.close();
      process.exit(1);
    }

    email = await question('Email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Error: Valid email is required');
      rl.close();
      process.exit(1);
    }

    phone = await question('Phone: ');
    if (!phone || phone.trim() === '') {
      console.error('❌ Error: Phone is required');
      rl.close();
      process.exit(1);
    }

    password = await question('Password (min 8 chars, include uppercase, lowercase, number, special char): ');
    if (!password || password.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters');
      rl.close();
      process.exit(1);
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      console.error('❌ Error: Password must include:');
      if (!hasUpperCase) console.error('   - At least one uppercase letter');
      if (!hasLowerCase) console.error('   - At least one lowercase letter');
      if (!hasNumber) console.error('   - At least one number');
      if (!hasSpecial) console.error('   - At least one special character');
      rl.close();
      process.exit(1);
    }

    console.log('\n────────────────────────────────────────\n');
  }

  await createAdmin(name, email, phone, password);
}

main();
