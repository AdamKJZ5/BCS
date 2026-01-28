# Testing Guide

## Overview

This project uses Jest and Supertest for comprehensive testing of the backend API.

## Testing Stack

- **Jest**: Test framework and runner
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated test database
- **ts-jest**: TypeScript support for Jest

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Test Structure

```
server/src/__tests__/
├── setup.ts          # Global test setup (database, environment)
├── auth.test.ts      # Authentication API tests
├── leads.test.ts     # Lead management API tests
└── utils.test.ts     # Utility function tests
```

## Writing Tests

### Example: API Endpoint Test

```typescript
import request from 'supertest';
import app from '../app';
import User from '../models/User';

describe('Authentication API', () => {
  it('should login with valid credentials', async () => {
    // Arrange: Create test data
    await User.create({
      email: 'test@example.com',
      password: 'hashed_password',
      name: 'Test User',
      phone: '1234567890'
    });

    // Act: Make API request
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    // Assert: Check response
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

### Example: Unit Test

```typescript
import { AppError } from '../utils/AppError';

describe('AppError', () => {
  it('should create an error with message and status code', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });
});
```

## Test Database

Tests use MongoDB Memory Server for an isolated in-memory database:

- Database is created fresh for each test suite
- All collections are cleared after each test
- No impact on development or production databases
- Fast and reliable test execution

## Environment Variables

Test-specific environment variables are loaded from `.env.test`:

```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret
ADMIN_API_KEY=test-admin-key
MONGO_URI=mongodb://localhost:27017/test
# ... other variables
```

The `setup.ts` file automatically overrides `MONGO_URI` with the memory server URI.

## Coverage Reports

After running `npm run test:coverage`, view the coverage report:

- Terminal: Summary displayed in console
- HTML: Open `coverage/index.html` in browser for detailed view

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests:

```typescript
beforeEach(async () => {
  // Set up test data for this specific test
  await User.create({...});
});

afterEach(async () => {
  // Cleanup is automatic via setup.ts
});
```

### 2. AAA Pattern

Structure tests with Arrange-Act-Assert:

```typescript
it('should do something', async () => {
  // Arrange: Set up test data and mocks
  const testData = {...};

  // Act: Execute the code being tested
  const result = await someFunction(testData);

  // Assert: Verify the results
  expect(result).toBe(expected);
});
```

### 3. Descriptive Test Names

Use clear, descriptive test names:

```typescript
// Good
it('should reject login with invalid password', async () => {...});

// Bad
it('test login', async () => {...});
```

### 4. Test Edge Cases

Test both success and failure scenarios:

```typescript
describe('POST /api/leads', () => {
  it('should create lead with valid data', async () => {...});
  it('should reject lead with missing required fields', async () => {...});
  it('should reject lead with invalid email', async () => {...});
  it('should detect honeypot spam', async () => {...});
});
```

### 5. Mock External Dependencies

Mock email sending, SMS, payment processors in tests:

```typescript
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));
```

## Common Test Patterns

### Testing Protected Routes

```typescript
it('should require authentication', async () => {
  const response = await request(app)
    .get('/api/customer/profile')
    .expect(401);

  expect(response.body.success).toBe(false);
});

it('should allow access with valid token', async () => {
  const token = generateTestToken();

  const response = await request(app)
    .get('/api/customer/profile')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```

### Testing Admin Routes

```typescript
it('should require admin API key', async () => {
  const response = await request(app)
    .get('/api/admin/leads')
    .expect(401);
});

it('should allow access with valid API key', async () => {
  const response = await request(app)
    .get('/api/admin/leads')
    .set('x-api-key', process.env.ADMIN_API_KEY)
    .expect(200);
});
```

### Testing Validation

```typescript
it('should validate email format', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User'
    })
    .expect(400);

  expect(response.body.success).toBe(false);
  expect(response.body.errors).toBeDefined();
});
```

## Debugging Tests

### Run Single Test File

```bash
npm test auth.test.ts
```

### Run Single Test

```typescript
it.only('should run only this test', async () => {
  // This test will run exclusively
});
```

### Skip Test

```typescript
it.skip('should skip this test', async () => {
  // This test will be skipped
});
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome and click "inspect".

## Continuous Integration

Add to CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test

- name: Upload coverage
  run: npm run test:coverage
  # Upload to Codecov, Coveralls, etc.
```

## Current Test Coverage

Run `npm run test:coverage` to see current coverage:

- Statements: Target 80%+
- Branches: Target 75%+
- Functions: Target 80%+
- Lines: Target 80%+

## Adding More Tests

Priority areas for additional tests:

1. **Controllers**: Test all controller functions
2. **Middleware**: Auth, validation, error handling
3. **Models**: Schema validation, virtuals, methods
4. **Utils**: Email formatting, date calculations, etc.
5. **Integration**: Full user workflows end-to-end

## Troubleshooting

### Tests Hanging

- Check for missing `await` keywords
- Ensure all promises are resolved
- Verify database connections close properly

### Random Test Failures

- Tests may not be isolated (shared state)
- Use `beforeEach` to reset data
- Check for timing issues with async code

### Memory Issues

- MongoDB Memory Server can use significant RAM
- Reduce concurrent tests if needed
- Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm test`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Note**: Always run tests before committing code and ensure all tests pass before deploying to production.
