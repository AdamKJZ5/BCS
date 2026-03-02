require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Import User model
const User = require('../dist/models/User').default;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n===========================================');
    console.log('   BCS Admin User Creation Script');
    console.log('===========================================\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const name = await question('Admin Name: ');
    const email = await question('Admin Email: ');
    const password = await question('Admin Password (min 8 characters): ');

    // Validate input
    if (!name || !email || !password) {
      console.log('❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      const overwrite = await question('Do you want to update this user to admin? (yes/no): ');

      if (overwrite.toLowerCase() === 'yes' || overwrite.toLowerCase() === 'y') {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.role = 'admin';
        existingUser.needsPasswordSetup = false;
        await existingUser.save();

        console.log('\n✅ User updated successfully!');
        console.log('===========================================');
        console.log('Admin Details:');
        console.log(`  Name: ${name}`);
        console.log(`  Email: ${email}`);
        console.log(`  Role: admin`);
        console.log('===========================================');
        console.log('\n⚠️  IMPORTANT: Save these credentials securely!\n');
      } else {
        console.log('❌ Operation cancelled.');
      }

      process.exit(0);
    }

    // Hash password
    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      needsPasswordSetup: false,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('===========================================');
    console.log('Admin Details:');
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  ID: ${admin._id}`);
    console.log('===========================================');
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('\nYou can now login at: /admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdmin();
