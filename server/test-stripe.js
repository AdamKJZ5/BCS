#!/usr/bin/env node

/**
 * Comprehensive Stripe Configuration Validator
 * Run this to verify your Stripe integration is set up correctly
 */

require('dotenv').config();

const runTests = async () => {
  console.log('\n🔍 Stripe Integration Validator\n');
  console.log('='.repeat(50));
  console.log('\n');

  let errorCount = 0;
  let warningCount = 0;

  // Step 1: Check environment variables
  console.log('📋 Step 1: Environment Variables\n');

  const envChecks = [
    { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY, required: true },
    { name: 'STRIPE_PUBLISHABLE_KEY', value: process.env.STRIPE_PUBLISHABLE_KEY, required: true },
    { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET, required: false }
  ];

  envChecks.forEach(check => {
    if (!check.value || check.value.includes('replace') || check.value.includes('dummy')) {
      if (check.required) {
        console.log(`❌ ${check.name}: Not set or using placeholder`);
        errorCount++;
      } else {
        console.log(`⚠️  ${check.name}: Not set (required for webhook verification)`);
        warningCount++;
      }
    } else {
      const masked = check.value.substring(0, 12) + '...' + check.value.substring(check.value.length - 4);
      console.log(`✅ ${check.name}: ${masked}`);
    }
  });

  console.log('\n');

  if (errorCount > 0) {
    console.log('❌ Missing required configuration!\n');
    console.log('Setup Instructions:');
    console.log('1. Visit https://dashboard.stripe.com/test/apikeys');
    console.log('2. Copy your test API keys');
    console.log('3. Update server/.env file\n');
    console.log('📖 See STRIPE_SETUP_GUIDE.md for detailed instructions\n');
    process.exit(1);
  }

  // Step 2: Initialize Stripe SDK
  console.log('📦 Step 2: Stripe SDK\n');

  let stripe;
  try {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover'
    });
    console.log('✅ Stripe SDK initialized successfully\n');
  } catch (error) {
    console.error('❌ Error initializing Stripe:', error.message);
    console.log('\n📦 Install Stripe: npm install stripe\n');
    process.exit(1);
  }

  // Step 3: Test API Connection
  console.log('🌐 Step 3: API Connection\n');

  try {
    await stripe.paymentIntents.list({ limit: 1 });
    console.log('✅ Successfully connected to Stripe API');
  } catch (err) {
    console.error('❌ Stripe API Error:', err.message);
    console.log('\n⚠️  Possible issues:');
    console.log('   - Invalid secret key');
    console.log('   - Account needs verification');
    console.log('   - Network connectivity issue\n');
    errorCount++;
  }

  console.log('\n');

  // Step 4: Validate Key Types
  console.log('🔑 Step 4: Key Validation\n');

  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';

  if (secretKey.startsWith('sk_test_')) {
    console.log('✅ Using TEST mode secret key');
  } else if (secretKey.startsWith('sk_live_')) {
    console.log('⚠️  Using LIVE mode secret key (be careful!)');
    warningCount++;
  } else {
    console.log('❌ Secret key format invalid');
    errorCount++;
  }

  if (publishableKey.startsWith('pk_test_')) {
    console.log('✅ Using TEST mode publishable key');
  } else if (publishableKey.startsWith('pk_live_')) {
    console.log('⚠️  Using LIVE mode publishable key');
    warningCount++;
  } else {
    console.log('❌ Publishable key format invalid');
    errorCount++;
  }

  // Check key mode mismatch
  const secretIsTest = secretKey.startsWith('sk_test_');
  const publishableIsTest = publishableKey.startsWith('pk_test_');

  if (secretIsTest !== publishableIsTest) {
    console.log('❌ Key mode mismatch! Secret and publishable keys must both be test OR live');
    errorCount++;
  }

  console.log('\n');

  // Step 5: Test Payment Intent Creation
  console.log('💳 Step 5: Payment Intent Creation\n');

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      metadata: { test: 'validation' },
    });
    console.log(`✅ Test payment intent created: ${paymentIntent.id}`);
  } catch (err) {
    console.error('❌ Failed to create payment intent:', err.message);
    errorCount++;
  }

  console.log('\n');

  // Step 6: Webhook Configuration
  console.log('🔗 Step 6: Webhook Configuration\n');

  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('replace')) {
    console.log('⚠️  Webhook secret not configured');
    console.log('   Webhooks are required for payment confirmation');
    console.log('   Run: stripe listen --forward-to localhost:5001/api/payments/webhook');
    console.log('   Then copy the webhook secret to .env');
    warningCount++;
  } else {
    console.log('✅ Webhook secret configured');
  }

  console.log('\n');

  // Summary
  console.log('='.repeat(50));
  console.log('\n📊 Summary\n');

  if (errorCount === 0 && warningCount === 0) {
    console.log('✅ All checks passed!');
    console.log('✨ Your Stripe integration is ready to use\n');
    console.log('🚀 Next Steps:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Start Stripe CLI: stripe listen --forward-to localhost:5001/api/payments/webhook');
    console.log('   3. Test with card: 4242 4242 4242 4242\n');
  } else {
    console.log(`⚠️  Found ${errorCount} error(s) and ${warningCount} warning(s)`);

    if (errorCount > 0) {
      console.log('\n❌ Critical issues must be fixed before using Stripe');
    }

    if (warningCount > 0) {
      console.log('\n⚠️  Warnings should be addressed for full functionality');
    }

    console.log('\n📖 See STRIPE_SETUP_GUIDE.md for help\n');

    if (errorCount > 0) {
      process.exit(1);
    }
  }
};

// Run tests
runTests().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
