# SMS Notifications Setup (Twilio)

SMS notifications are now integrated into the appointment system! Follow these steps to enable SMS:

## 1. Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your phone number

## 2. Get Twilio Credentials

1. Go to your [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token**
3. Get a Twilio phone number:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capabilities
   - Trial accounts get $15 in credit

## 3. Add Environment Variables

Add these to your `.env` file in the `/server` directory:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:** The phone number must include the country code (e.g., +1 for US)

## 4. Test SMS Configuration

Use the test SMS endpoint to verify everything works:

```bash
curl -X POST http://localhost:5000/api/appointments/test-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"phoneNumber": "+15551234567"}'
```

## What SMS Notifications Are Sent?

### 1. **Appointment Reminders (24 hours before)**
- Sent automatically by cron job at 9 AM daily
- Includes appointment type, date, time, location
- Sent alongside email reminders

### 2. **Status Updates**
- `confirmed`: Appointment confirmed
- `in_progress`: We've started working on your vehicle
- `completed`: Vehicle is ready for pickup
- `cancelled`: Appointment cancelled

### 3. **Invoice Created**
- Sent when admin creates invoice from appointment
- Includes invoice number, total amount, due date
- Link to customer dashboard for payment

## Trial Account Limitations

Twilio trial accounts have restrictions:
- Can only send SMS to **verified phone numbers**
- Messages include "Sent from a Twilio trial account" prefix
- $15 credit (~500 SMS messages)

To send to any number, upgrade to a paid account ($20/month minimum).

## Verifying Phone Numbers (Trial Account)

For trial accounts, verify customer phone numbers:

1. Go to Twilio Console → Phone Numbers → Manage → Verified Caller IDs
2. Click "+ Add a new Caller ID"
3. Enter the customer's phone number
4. They'll receive a verification code

## Disable SMS Notifications

To disable SMS (keep only email):
- Simply don't add the Twilio environment variables
- The system will gracefully skip SMS and log a message
- Email notifications will continue working

## Costs (Paid Account)

- **Phone number**: ~$1/month
- **SMS (US)**: $0.0079 per message
- **SMS (International)**: Varies by country

Example: 1000 SMS/month ≈ $9/month total

## Troubleshooting

### "SMS notifications not configured"
- Check that all 3 environment variables are set
- Restart the server after adding variables

### "Failed to send SMS"
- Verify phone number format includes country code (+1 for US)
- Check Twilio account has credits
- For trial: ensure number is verified

### Phone number validation errors
- Customer phone numbers are automatically formatted
- System adds +1 for 10-digit US numbers
- Invalid formats are skipped (email still sent)

## Support

- Twilio Documentation: [https://www.twilio.com/docs/sms](https://www.twilio.com/docs/sms)
- Twilio Support: [https://support.twilio.com](https://support.twilio.com)
