# Monitoring & Alerting Guide

## Overview

This guide covers the comprehensive monitoring setup for your application, including error tracking, uptime monitoring, performance monitoring, and alerting.

## 🎯 Monitoring Stack

### 1. Sentry (Error Tracking & Performance)

**What It Does:**
- Captures and tracks application errors
- Performance monitoring and profiling
- Release tracking
- User impact analysis
- Source map support

**Setup:**

1. **Create Sentry Account:**
   - Go to https://sentry.io/
   - Sign up for free account (generous free tier)
   - Create new project → Select "Node.js/Express"

2. **Get Your DSN:**
   - After creating project, copy the DSN
   - Format: `https://xxxxx@sentry.io/12345`

3. **Add to Environment:**
```bash
# Add to server/.env
SENTRY_DSN=https://your-actual-dsn@sentry.io/your-project-id
```

4. **Restart Server:**
```bash
npm run dev
```

5. **Verify Integration:**
   - Check console: "✅ Sentry initialized for error tracking"
   - Trigger test error: Visit http://localhost:5001/test-error
   - Check Sentry dashboard for error report

**Features Enabled:**
- ✅ Automatic error capture
- ✅ Performance monitoring (10% sampling in production)
- ✅ Request tracing
- ✅ User context tracking
- ✅ Release tracking
- ✅ Sensitive data filtering (passwords, tokens)

**Usage in Code:**
```typescript
import { captureException, captureMessage } from '../config/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, {
    extra: { userId, invoiceId }
  });
}

// Log custom messages
captureMessage('Payment threshold exceeded', 'warning');
```

---

### 2. Health Check Endpoints

**Purpose:** Allow uptime monitoring services to check if your application is running correctly.

**Endpoints:**

#### Basic Health Check
```http
GET /health
```
Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T20:00:00.000Z",
  "uptime": 3600
}
```

#### Detailed Health Check
```http
GET /health/detailed
```
Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T20:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": "healthy",
    "memory": "healthy",
    "stripe": "configured"
  },
  "memory": {
    "used": 45,
    "total": 128,
    "percentage": 35
  }
}
```

#### Readiness Probe
```http
GET /health/ready
```
Returns 200 if app is ready to serve traffic, 503 if not.

#### Liveness Probe
```http
GET /health/live
```
Returns 200 if process is alive.

#### Metrics (Prometheus Format)
```http
GET /metrics
```
Returns metrics in Prometheus format for monitoring systems.

---

### 3. Uptime Monitoring Services

Choose one or more of these services to monitor your application uptime:

#### **UptimeRobot** (Recommended - Free)

**Setup:**
1. Go to https://uptimerobot.com/
2. Sign up for free account
3. Add new monitor:
   - Type: HTTP(s)
   - URL: https://yourdomain.com/health
   - Interval: 5 minutes (free tier)
   - Alert contacts: Your email

**Features:**
- ✅ 50 monitors free
- ✅ 5-minute intervals
- ✅ Email/SMS alerts
- ✅ Status page
- ✅ Response time tracking

#### **Pingdom**

**Setup:**
1. Go to https://www.pingdom.com/
2. Sign up for free trial
3. Create uptime check:
   - URL: https://yourdomain.com/health
   - Check interval: 1 minute

**Features:**
- ✅ Real browser testing
- ✅ Transaction monitoring
- ✅ Global monitoring locations

#### **BetterUptime**

**Setup:**
1. Go to https://betteruptime.com/
2. Sign up for free account
3. Add monitor:
   - URL: https://yourdomain.com/health
   - Check every 30 seconds

**Features:**
- ✅ Fast checks (30s)
- ✅ Incident management
- ✅ On-call scheduling
- ✅ Status pages

---

### 4. Application Performance Monitoring (APM)

#### **New Relic** (Optional)

**What It Does:**
- Deep performance monitoring
- Transaction tracing
- Database query analysis
- Infrastructure monitoring

**Setup:**
```bash
npm install newrelic

# Add to server/.env
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME="BCS API"
```

#### **Datadog** (Optional)

**What It Does:**
- Full-stack monitoring
- Log aggregation
- APM
- Infrastructure monitoring

**Setup:**
```bash
npm install dd-trace

# Add at top of server.ts
require('dd-trace').init();
```

---

## 📊 Monitoring Dashboard

### What to Monitor

#### Critical Metrics

1. **Uptime**
   - Target: 99.9% (8.76 hours downtime/year)
   - Alert: If down for 5+ minutes

2. **Response Time**
   - Target: <200ms average
   - Alert: If >500ms for 5+ minutes

3. **Error Rate**
   - Target: <1% of requests
   - Alert: If >5% for 5 minutes

4. **Database Connection**
   - Target: Always connected
   - Alert: Immediately on disconnect

5. **Memory Usage**
   - Target: <75% of available
   - Warning: >75%
   - Critical: >90%

6. **Disk Space**
   - Target: <70% full
   - Warning: >80%
   - Critical: >90%

#### Business Metrics

7. **Lead Submissions**
   - Track: Daily submissions
   - Alert: If zero submissions for 24h

8. **Payment Success Rate**
   - Track: Payment attempts vs successes
   - Alert: If <95% success rate

9. **Active Users**
   - Track: Daily/weekly active users
   - Alert: Significant drop (>50%)

---

## 🚨 Alert Configuration

### Critical Alerts (Immediate Action)

- ❌ Server down (5+ minutes)
- ❌ Database disconnected
- ❌ Payment processing failure
- ❌ Memory usage >90%
- ❌ Disk space >90%

**Notification:** SMS + Email + Slack

### Warning Alerts (Review Within Hour)

- ⚠️ High error rate (>5%)
- ⚠️ Slow response times (>500ms)
- ⚠️ Memory usage >75%
- ⚠️ No backups in 24h

**Notification:** Email + Slack

### Info Alerts (Review Daily)

- ℹ️ Unusual traffic patterns
- ℹ️ New error types
- ℹ️ Performance degradation
- ℹ️ Resource usage trends

**Notification:** Dashboard + Daily digest

---

## 📈 Monitoring Checklist

### Initial Setup

- [ ] Sign up for Sentry account
- [ ] Add SENTRY_DSN to .env
- [ ] Verify Sentry integration working
- [ ] Sign up for uptime monitoring (UptimeRobot)
- [ ] Add health check monitors
- [ ] Configure alert contacts
- [ ] Test alerts (trigger intentional error)
- [ ] Set up status page (optional)

### Daily Checks

- [ ] Review Sentry error dashboard
- [ ] Check uptime percentage
- [ ] Review response time trends
- [ ] Check server logs for warnings
- [ ] Verify backup completion
- [ ] Review memory/CPU usage

### Weekly Review

- [ ] Analyze error patterns
- [ ] Review performance trends
- [ ] Check for security incidents
- [ ] Update alert thresholds if needed
- [ ] Review backup restoration success
- [ ] Plan performance optimizations

### Monthly Review

- [ ] Performance audit
- [ ] Cost optimization
- [ ] Update monitoring strategy
- [ ] Review SLA metrics
- [ ] Disaster recovery drill
- [ ] Update documentation

---

## 🔍 Troubleshooting Monitors

### Health Check Returns 503

**Causes:**
- Database not connected
- Missing environment variables
- Server overloaded

**Actions:**
1. Check `/health/detailed` for specific issue
2. Review server logs: `tail -f logs/error-*.log`
3. Check database connection
4. Verify environment variables

### High Memory Usage

**Investigation:**
```bash
# Check Node.js memory
GET /health/detailed

# Check system memory
free -h

# Check process memory
top -p $(pgrep -f "node.*server")
```

**Solutions:**
- Restart application
- Increase memory limit: `NODE_OPTIONS="--max-old-space-size=4096"`
- Optimize queries
- Add caching layer

### High Error Rate

**Investigation:**
1. Check Sentry dashboard for error details
2. Review error logs: `grep ERROR logs/error-*.log`
3. Check for patterns (specific endpoint, time of day)
4. Review recent deployments

**Solutions:**
- Rollback if caused by recent deployment
- Fix identified bugs
- Add better error handling
- Improve input validation

---

## 🛠️ Advanced Monitoring

### Log Aggregation (Optional)

#### **Loggly**

```bash
# Install Winston Loggly transport
npm install winston-loggly-bulk

# Configure in logger.ts
import { Loggly } from 'winston-loggly-bulk';

logger.add(new Loggly({
  token: process.env.LOGGLY_TOKEN,
  subdomain: 'your-subdomain',
  tags: ['bcs', 'production'],
}));
```

#### **Papertrail**

```bash
npm install winston-syslog

# Add to logger.ts
import winston from 'winston';
require('winston-syslog').Syslog;

logger.add(new winston.transports.Syslog({
  host: 'logs.papertrailapp.com',
  port: 12345,
}));
```

### Custom Metrics

Add custom business metrics to your code:

```typescript
// Track lead conversions
loggers.audit('lead_converted', 'system', 'Lead', leadId, {
  source: lead.source,
  conversionTime: timeDiff,
});

// Track payment metrics
loggers.payment('payment_success', amount, invoiceId, {
  paymentMethod: method,
  processingTime: duration,
});
```

---

## 📞 Incident Response

### On-Call Procedure

1. **Receive Alert**
   - Check alert details
   - Verify it's not false positive

2. **Assess Severity**
   - P1 (Critical): Complete outage
   - P2 (High): Partial outage or degraded performance
   - P3 (Medium): Non-critical issues

3. **Initial Response**
   - Acknowledge alert
   - Check health endpoints
   - Review recent changes
   - Check server logs

4. **Mitigation**
   - Rollback recent deployment (if applicable)
   - Restart service if needed
   - Apply hotfix
   - Scale resources if needed

5. **Communication**
   - Update status page
   - Notify stakeholders
   - Provide ETA for resolution

6. **Resolution**
   - Verify issue resolved
   - Monitor for 30 minutes
   - Close incident
   - Schedule post-mortem

7. **Post-Mortem**
   - Document what happened
   - Root cause analysis
   - Action items to prevent recurrence
   - Update runbooks

---

## 📚 Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [UptimeRobot Help](https://uptimerobot.com/help/)
- [Health Check Best Practices](https://docs.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring)
- [SRE Book by Google](https://sre.google/sre-book/table-of-contents/)

---

## 🎓 Best Practices

### Do's ✅

- Monitor all critical services
- Set up redundant alerting
- Test alerts regularly
- Keep runbooks updated
- Track SLA metrics
- Review monitoring costs
- Automate responses where possible

### Don'ts ❌

- Don't ignore alerts
- Don't set overly sensitive alerts (alert fatigue)
- Don't monitor everything (focus on critical metrics)
- Don't forget to update alert contacts
- Don't skip post-mortems
- Don't rely on single monitoring service

---

**Remember:** Good monitoring gives you peace of mind and helps you catch issues before your users do!
