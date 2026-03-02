#!/usr/bin/env node

/**
 * Script to promote an existing user to admin role
 *
 * Usage:
 *   node promote-to-admin.js user@example.com
 */

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI not found in .env file');
  process.exit(1);
}

// Define User Schema inline
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  phone: String,
  role: String,
  createdAt: Date,
});

const User = mongoose.model('User', userSchema);

async function promoteToAdmin(email) {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ Error: No user found with email ${email}`);
      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`ℹ️  User ${email} is already an admin`);
      process.exit(0);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User promoted to admin successfully!\n');
    console.log('📋 User Details:');
    console.log(`   Name:  ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Role:  ${user.role}`);
    console.log('\n🔐 They can now login at: http://localhost:5137/admin/login\n');

  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Please provide an email address');
  console.log('\nUsage:');
  console.log('  node promote-to-admin.js user@example.com');
  process.exit(1);
}

promoteToAdmin(email);
