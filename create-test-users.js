#!/usr/bin/env node

/**
 * Create Test Users Script
 * Creates sample customer and admin users for testing
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log(colors.green + '✅ Connected to MongoDB' + colors.reset + '\n');

    // Import User model (must be after mongoose.connect)
    const User = require('./server/dist/models/User').default;

    const users = [
      {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'Password123',
        phone: '(425) 555-0001',
        role: 'customer'
      },
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'Admin123',
        phone: '(425) 555-0002',
        role: 'admin'
      },
      {
        name: 'John Customer',
        email: 'john@test.com',
        password: 'Password123',
        phone: '(425) 555-0003',
        role: 'customer'
      }
    ];

    console.log('Creating users...\n');

    for (const userData of users) {
      try {
        // Check if user already exists
        const existing = await User.findOne({ email: userData.email });

        if (existing) {
          console.log(colors.yellow + `⚠️  User ${userData.email} already exists, skipping...` + colors.reset);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          phone: userData.phone,
          role: userData.role,
          needsPasswordSetup: false
        });

        console.log(colors.green + '✅ Created user:' + colors.reset);
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Password:', userData.password);
        console.log('   Role:', user.role);
        console.log('');

      } catch (error) {
        console.log(colors.red + `❌ Failed to create ${userData.email}: ${error.message}` + colors.reset);
      }
    }

    console.log(colors.green + '✅ Test users created successfully!' + colors.reset);
    console.log('\n📝 Login credentials:\n');
    console.log('Customer Login:');
    console.log('  URL: http://localhost:5173/customer/login');
    console.log('  Email: customer@test.com');
    console.log('  Password: Password123\n');
    console.log('Admin Login:');
    console.log('  URL: http://localhost:5173/admin/login');
    console.log('  Email: admin@test.com');
    console.log('  Password: Admin123\n');

    process.exit(0);

  } catch (error) {
    console.error(colors.red + '\n❌ Error:', error.message + colors.reset);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
createTestUsers();
