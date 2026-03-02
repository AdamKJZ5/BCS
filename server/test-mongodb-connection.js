#!/usr/bin/env node

/**
 * Test MongoDB Connection
 * Run: node test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 Testing MongoDB Connection...\n');
console.log('MongoDB URI:', MONGO_URI?.replace(/\/\/.*@/, '//<credentials>@'));
console.log('');

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

// Set timeout to 10 seconds
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected successfully');
    console.log('');
    console.log('Connection details:');
    console.log('- Host:', mongoose.connection.host);
    console.log('- Database:', mongoose.connection.name);
    console.log('- Ready state:', mongoose.connection.readyState);
    console.log('');
    console.log('🎉 Your server should now start without errors!');
    console.log('Run: npm run dev');

    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILED! Could not connect to MongoDB\n');

    if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.error('Problem: IP address not whitelisted in MongoDB Atlas\n');
      console.error('Solution:');
      console.error('1. Go to https://cloud.mongodb.com');
      console.error('2. Click Network Access (in left sidebar)');
      console.error('3. Click "+ ADD IP ADDRESS"');
      console.error('4. Select "ALLOW ACCESS FROM ANYWHERE" or add: 174.204.70.115');
      console.error('5. Wait 1-2 minutes, then run this script again');
    } else if (err.message.includes('ENOTFOUND')) {
      console.error('Problem: Cannot reach MongoDB server\n');
      console.error('Possible causes:');
      console.error('- Cluster is paused (go to Atlas and click "Resume")');
      console.error('- Internet connection issue');
      console.error('- Invalid MongoDB URI');
    } else if (err.message.includes('Authentication')) {
      console.error('Problem: Invalid credentials\n');
      console.error('Solution: Check username/password in MONGO_URI');
    } else {
      console.error('Error details:', err.message);
    }

    console.error('');
    process.exit(1);
  });
