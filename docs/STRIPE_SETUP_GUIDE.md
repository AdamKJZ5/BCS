# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for your auto body shop invoice system.

## Overview

Your application uses Stripe to:
- Process invoice payments from customers
- Handle credit card transactions securely
- Automatically update invoice status when payments succeed
- Support automatic payment methods (cards, digital wallets)

## Step 1: Create/Access Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a new account or log in to your existing account
3. Complete the account verification process

## Step 2: Get Your API Keys

### For Development (Test Mode)

1. In your Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API keys**
3. Make sure you're in **Test mode** (toggle at top right)
4. You'll see two keys:
   - **Publishable key**: Starts with `pk_test_...` (visible by default)
   - **Secret key**: Starts with `sk_test_...` (click "Reveal test key")

5. Copy both keys and add them to your `server/.env` file:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

### Test Cards

In test mode, use these card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

## Step 3: Set Up Webhooks (Required for Payment Confirmation)

Webhooks allow Stripe to notify your server when payments succeed. This is **critical** for automatically updating invoice status.

### For Local Development (Using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # Mac
   brew install stripe/stripe-cli/stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```
   This will open your browser to authorize the CLI.

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

4. **Copy the webhook signing secret**:
   The CLI will display something like:
   ```
   Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. **Add to your .env file**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_the_secret_from_cli
   ```

6. **Keep the CLI running** while developing. It will show webhook events in real-time.

### For Production (Using Stripe Dashboard)

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Click to reveal the **Signing secret** (starts with `whsec_...`)
7. Add this to your production `.env` file

## Step 4: Test the Integration

1. **Start your server**:
   ```bash
   cd server
   npm run dev
   ```

2. **In another terminal, run Stripe CLI** (for local testing):
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

3. **Test the payment flow**:
   - Create an invoice in your admin dashboard
   - As a customer, view the invoice and click "Pay Now"
   - Use test card: `4242 4242 4242 4242`
   - Check the invoice is marked as "Paid" after payment

4. **Verify webhook events**:
   - Watch the Stripe CLI terminal for webhook events
   - Check your server logs for "Payment recorded for invoice..."

## Step 5: Go Live (When Ready)

### Switch to Live Mode

1. Complete your Stripe account verification:
   - Provide business details
   - Add bank account for payouts
   - Verify your identity

2. Get your **Live** API keys:
   - Toggle to **Live mode** in Stripe Dashboard
   - Go to **Developers → API keys**
   - Copy the live keys (start with `pk_live_...` and `sk_live_...`)

3. Update production `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_actual_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key
   ```

4. Set up production webhook (see Step 3 "For Production")

5. Test with a real card (small amount first!)

## How the Integration Works

### Payment Flow

1. **Customer initiates payment**:
   - Views invoice in customer portal
   - Clicks "Pay Now"
   - Frontend calls: `POST /api/payments/create-payment-intent`

2. **Server creates payment intent**:
   - Validates invoice belongs to customer
   - Creates Stripe payment intent with invoice amount
   - Returns `clientSecret` to frontend

3. **Customer enters card details**:
   - Frontend shows Stripe payment form
   - Customer submits card information
   - Stripe processes payment securely

4. **Stripe sends webhook**:
   - On payment success, Stripe sends `payment_intent.succeeded` event
   - Your server receives webhook at: `POST /api/payments/webhook`
   - Server verifies webhook signature
   - Updates invoice: adds payment, updates status to "paid"

### Security Features

- **PCI Compliance**: Card details never touch your server
- **Webhook signatures**: Verify events actually came from Stripe
- **Raw body parsing**: Special middleware preserves webhook signature
- **API authentication**: Customer must be logged in to pay invoices
- **Authorization**: Customers can only pay their own invoices

## Frontend Integration

Your frontend needs to:

1. **Load Stripe.js**:
   Already in `client/index.html`:
   ```html
   <script src="https://js.stripe.com/v3/"></script>
   ```

2. **Get publishable key**:
   ```typescript
   const config = await api.get('/api/payments/config');
   const stripe = Stripe(config.publishableKey);
   ```

3. **Create payment form**:
   See `client/src/components/PaymentModal.tsx` for the implementation

## Troubleshooting

### Server won't start
- **Error**: "Neither apiKey nor config.authenticator provided"
- **Fix**: Make sure `STRIPE_SECRET_KEY` is set in `.env` file

### Webhooks not working
- **Issue**: Payment succeeds but invoice status doesn't update
- **Check**:
  - Is Stripe CLI running? (`stripe listen`)
  - Is webhook secret in `.env`?
  - Check server logs for webhook errors
  - Verify webhook endpoint is accessible

### Payment fails in test mode
- **Use test cards**: `4242 4242 4242 4242`
- **Check**: Amount should be > 0
- **Logs**: Check server console for Stripe errors

### Live mode issues
- **Verify account**: Complete Stripe account verification
- **Check keys**: Make sure using live keys (pk_live, sk_live)
- **Test small**: Try $1 payment first with real card

## Monitoring & Analytics

### Stripe Dashboard

View in your Stripe Dashboard:
- **Payments**: All successful payments
- **Customers**: Customer records
- **Events**: Webhook delivery logs
- **Logs**: API request logs

### In Your Application

- Server logs show payment processing
- Invoice records include payment history
- Customer notifications can be sent via email

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Testing**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks
- **API Reference**: https://stripe.com/docs/api

## Next Steps

1. Get API keys and add to `.env`
2. Install and run Stripe CLI for local testing
3. Test payment flow with test cards
4. When ready, complete verification and go live

---

**Important**: Never commit your `.env` file to git. Your Stripe keys should remain secret.
