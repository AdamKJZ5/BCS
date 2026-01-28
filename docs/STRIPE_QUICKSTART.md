# Stripe Quick Start (5 Minutes)

Follow these steps to get Stripe working right now:

## Step 1: Get Your Stripe Keys (2 min)

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Click "Reveal test key" and copy **Secret key** (starts with `sk_test_`)

## Step 2: Update .env File (1 min)

Open `server/.env` and replace these lines with your actual keys:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

## Step 3: Test Configuration (30 sec)

```bash
cd server
node test-stripe.js
```

If you see ✅ checks, you're good to go!

## Step 4: Start Your Server (30 sec)

```bash
npm run dev
```

Your server should now start without errors!

## Step 5: Set Up Webhooks (1 min)

Webhooks are needed to automatically update invoice status when payments succeed.

### Install Stripe CLI (one-time setup):

```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows/Linux - download from:
# https://stripe.com/docs/stripe-cli
```

### Login and Start Listening:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the webhook secret (starts with `whsec_`) and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

**Keep this terminal window open while developing!**

## Test Payment Flow

1. Create an invoice in your admin dashboard
2. View as customer and click "Pay"
3. Use test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
4. Submit payment
5. Invoice should update to "Paid" status

Watch the Stripe CLI terminal to see webhook events in real-time!

---

## Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires 3D Secure**: 4000 0025 0000 3155

## Troubleshooting

**Server won't start?**
- Make sure keys are in `.env` file
- Remove placeholder text (don't leave "replace_with_your...")
- Run `node test-stripe.js` to verify

**Payment succeeds but invoice not updated?**
- Is Stripe CLI running? (`stripe listen`)
- Check webhook secret is in `.env`
- Look for errors in server console

**Need more help?**
- See full guide: `STRIPE_SETUP_GUIDE.md`
- Stripe docs: https://stripe.com/docs/testing
