#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
  needsPasswordSetup: { type: Boolean, default: false },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const customers = [
  { name: 'Test Customer', email: 'customer@test.com', password: 'Password123', phone: '(425) 555-0001' },
  { name: 'John Customer',  email: 'john@test.com',     password: 'Password123', phone: '(425) 555-0003' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to', process.env.MONGO_URI);
  for (const c of customers) {
    const existing = await User.findOne({ email: c.email });
    if (existing) { console.log('skip (exists):', c.email); continue; }
    const hashed = await bcrypt.hash(c.password, 10);
    await User.create({ ...c, password: hashed, role: 'customer', needsPasswordSetup: false });
    console.log('created:', c.email, '/', c.password);
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
