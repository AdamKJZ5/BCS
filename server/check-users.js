#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('email name phone role createdAt').lean();

    const adminCount = users.filter(u => u.role === 'admin').length;
    const customerCount = users.filter(u => u.role === 'customer').length;

    console.log(`📊 Total Users in Database: ${users.length}`);
    console.log(`   👑 Admins: ${adminCount}`);
    console.log(`   👤 Customers: ${customerCount}\n`);

    if (users.length === 0) {
      console.log('⚠️  No users found in database');
    } else {
      console.log('Users:');
      console.log('─'.repeat(80));
      users.forEach((user, i) => {
        const roleIcon = user.role === 'admin' ? '👑' : '👤';
        const roleColor = user.role === 'admin' ? '\x1b[33m' : '\x1b[36m'; // Yellow for admin, Cyan for customer
        const reset = '\x1b[0m';

        console.log(`${i + 1}. ${user.name || 'N/A'} ${roleColor}[${roleIcon} ${user.role?.toUpperCase() || 'CUSTOMER'}]${reset}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('');
      });
    }

    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
