# Logging and Monitoring Guide

## Overview

This application uses Winston for comprehensive logging and Morgan for HTTP request logging.

## Log Levels

Logs are organized by severity:

1. **error**: Error events that might still allow the application to continue
2. **warn**: Warning messages indicating potential issues
3. **info**: Informational messages highlighting progress
4. **http**: HTTP request/response logging
5. **debug**: Detailed information for debugging (development only)

## Log Files

Logs are automatically rotated daily and stored in the `logs/` directory:

### File Structure

```
logs/
├── combined-2026-01-26.log    # All logs
├── error-2026-01-26.log       # Error logs only
└── http-2026-01-26.log        # HTTP requests
```

### Retention Policy

- **Error logs**: 30 days
- **Combined logs**: 14 days
- **HTTP logs**: 7 days
- **Max file size**: 20MB (auto-rotates)

## Using the Logger

### Import the Logger

```typescript
import logger, { loggers } from '../utils/logger';
```

### Basic Logging

```typescript
// Simple log messages
logger.info('User logged in');
logger.error('Failed to send email');
logger.warn('Rate limit approaching');
logger.debug('Processing request', { userId: '123' });
```

### Specialized Loggers

#### Authentication Events

```typescript
loggers.auth('login', 'user@example.com', true, {
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});
```

#### Payment Events

```typescript
loggers.payment('payment_success', 299.99, 'INV-001', {
  paymentMethod: 'stripe',
  transactionId: 'pi_123456'
});
```

#### Email Events

```typescript
loggers.email('customer@example.com', 'Invoice #1234', true);
// or
loggers.email('customer@example.com', 'Invoice #1234', false, 'SMTP connection failed');
```

#### Database Operations

```typescript
loggers.database('insert', 'users', {
  userId: 'user123',
  fields: ['email', 'name']
});
```

#### Error Logging with Context

```typescript
try {
  // Some operation
} catch (error) {
  loggers.error('Failed to process payment', error as Error, {
    invoiceId: 'INV-001',
    userId: 'user123',
    amount: 299.99
  });
}
```

#### Security Events

```typescript
loggers.security('multiple_failed_logins', 'high', {
  email: 'user@example.com',
  attempts: 5,
  ip: '192.168.1.1'
});
```

#### Audit Trail

```typescript
loggers.audit(
  'update_invoice',
  'admin123',
  'Invoice',
  'INV-001',
  { status: { from: 'pending', to: 'paid' } }
);
```

## HTTP Request Logging

HTTP requests are automatically logged via Morgan middleware:

```
GET /api/invoices 200 45ms - user123
POST /api/auth/login 401 12ms - anonymous
```

Format in production:
```
192.168.1.1 - user123 [26/Jan/2026:10:30:45 +0000] "GET /api/invoices HTTP/1.1" 200 1234 "-" "Mozilla/5.0..." 45 ms
```

## Viewing Logs

### Real-time Monitoring (Development)

Logs are printed to console in development with color coding:

- 🔴 **RED**: Errors
- 🟡 **YELLOW**: Warnings
- 🟢 **GREEN**: Info
- 🟣 **MAGENTA**: HTTP requests
- 🔵 **BLUE**: Debug

### Production Logs

In production, only file logs are created (no console output for performance).

### Viewing Log Files

```bash
# View latest combined logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# View latest error logs
tail -f logs/error-$(date +%Y-%m-% d).log

# View latest HTTP logs
tail -f logs/http-$(date +%Y-%m-%d).log

# Search logs
grep "payment_success" logs/combined-*.log

# Filter by level
grep '"level":"error"' logs/combined-*.log | jq .
```

## Log Analysis

### Using jq for JSON Parsing

Since logs are stored in JSON format, use `jq` for analysis:

```bash
# Count errors by type
cat logs/error-*.log | jq -r '.message' | sort | uniq -c | sort -nr

# Find all failed payments
cat logs/combined-*.log | jq 'select(.message == "Payment Event" and .event == "payment_failed")'

# List all admin actions
cat logs/combined-*.log | jq 'select(.message == "Audit Trail")'

# View errors with stack traces
cat logs/error-*.log | jq 'select(.error.stack != null)'
```

### Common Queries

#### Find Failed Login Attempts

```bash
cat logs/combined-*.log | jq 'select(.event == "login" and .success == false)'
```

#### Track User Activity

```bash
cat logs/http-*.log | jq 'select(.userId == "user123")'
```

#### Monitor Payment Activity

```bash
cat logs/combined-*.log | jq 'select(.message == "Payment Event")'
```

## Integration with Controllers

### Example: Auth Controller

```typescript
import { loggers } from '../utils/logger';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      loggers.auth('login', email, false, {
        reason: 'invalid_credentials',
        ip: req.ip
      });
      return res.status(401).json({ success: false });
    }

    loggers.auth('login', email, true, {
      userId: user.id,
      ip: req.ip
    });

    res.json({ success: true, token: generateToken(user) });
  } catch (error) {
    loggers.error('Login failed', error as Error, { email });
    res.status(500).json({ success: false });
  }
};
```

### Example: Payment Controller

```typescript
export const handlePaymentSuccess = async (paymentIntent: any) => {
  const { invoiceId, amount } = paymentIntent.metadata;

  try {
    // Update invoice
    await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid' });

    loggers.payment('payment_success', amount / 100, invoiceId, {
      paymentIntentId: paymentIntent.id,
      method: 'stripe'
    });

    loggers.audit(
      'payment_received',
      'system',
      'Invoice',
      invoiceId,
      { amount: amount / 100, status: 'paid' }
    );
  } catch (error) {
    loggers.error('Payment processing failed', error as Error, {
      invoiceId,
      paymentIntentId: paymentIntent.id
    });
  }
};
```

## Error Handling

Errors are automatically logged with full context through the error logger middleware:

```typescript
// In app.ts
app.use(errorLogger); // Logs errors with request context
app.use(errorHandler); // Handles and responds to errors
```

Logged information includes:
- Error message and stack trace
- HTTP method and URL
- Request body and query parameters
- User ID (if authenticated)
- IP address and user agent

## Monitoring and Alerts

### Production Monitoring

Consider integrating with:

1. **Log Aggregation**:
   - Elasticsearch + Kibana
   - Splunk
   - Datadog
   - Loggly

2. **Error Tracking**:
   - Sentry
   - Rollbar
   - Bugsnag

3. **APM (Application Performance Monitoring)**:
   - New Relic
   - AppDynamics
   - Dynatrace

### Alert Examples

Set up alerts for:

- Error rate exceeds threshold
- Failed payment attempts
- Multiple failed login attempts (security)
- API response time degradation
- Database connection failures

## Best Practices

### Do's ✅

- Use appropriate log levels
- Include context (user IDs, request IDs, etc.)
- Log security-relevant events
- Log errors with full stack traces
- Use structured logging (JSON format)
- Log audit trails for admin actions
- Log payment transactions

### Don'ts ❌

- Don't log sensitive data (passwords, tokens, credit card numbers)
- Don't log in tight loops (causes performance issues)
- Don't use console.log in production code (use logger instead)
- Don't log large objects (log relevant fields only)
- Don't ignore errors silently

### Sanitizing Sensitive Data

```typescript
// Bad
logger.info('User created', { user });

// Good
logger.info('User created', {
  userId: user.id,
  email: user.email,
  // Don't log password field
});

// Payment data
logger.info('Payment processed', {
  amount: payment.amount,
  last4: payment.card.last4, // Only last 4 digits
  // Don't log full card number
});
```

## Performance Considerations

- Logs are written asynchronously (non-blocking)
- File rotation prevents disk space issues
- Console logging is disabled in test environment
- Production uses file-only logging (no console overhead)

## Troubleshooting

### Logs Not Appearing

1. Check log level setting
2. Verify `logs/` directory exists and is writable
3. Check if NODE_ENV is set correctly
4. Ensure logger is imported correctly

### Large Log Files

1. Review retention policy (reduce days if needed)
2. Reduce log level in production (info instead of debug)
3. Check for logging loops
4. Implement log sampling for high-volume events

### Missing Context

Always include relevant context:

```typescript
// Bad
logger.error('Payment failed');

// Good
loggers.error('Payment failed', error, {
  invoiceId: 'INV-001',
  userId: 'user123',
  amount: 299.99,
  paymentMethod: 'stripe'
});
```

## Log Rotation Schedule

Automatic rotation occurs at midnight (local time) based on:

- Date pattern: `YYYY-MM-DD`
- Max file size: 20MB
- Retention: Varies by log type

Manual rotation (if needed):

```bash
# Archive old logs
tar -czf logs-archive-$(date +%Y%m%d).tar.gz logs/*.log
# Remove archived originals
rm logs/*.log
```

## Summary

The logging system provides:

- ✅ Structured JSON logging
- ✅ Automatic log rotation
- ✅ Multiple log levels
- ✅ HTTP request logging
- ✅ Error tracking with context
- ✅ Audit trails for admin actions
- ✅ Security event logging
- ✅ Production-ready configuration

Use logs for debugging, monitoring, security auditing, and compliance requirements.
