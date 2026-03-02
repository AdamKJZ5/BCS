function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }

  return value;
}

// Validate JWT_SECRET strength
function validateJWTSecret(secret: string): void {
  if (secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters for security');
  }
}

// Validate all required environment variables on startup
function validateEnvironment(): void {
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'OWNER_EMAIL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    throw new Error('Please set all required environment variables in .env file');
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET) {
    validateJWTSecret(process.env.JWT_SECRET);
  }

  console.log('✅ Environment variables validated successfully');
}

// Run validation
validateEnvironment();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5138),

  MONGO_URI: requireEnv("MONGO_URI"),

  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: Number(requireEnv("SMTP_PORT")),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),

  OWNER_EMAIL: requireEnv("OWNER_EMAIL"),
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "", // Optional for legacy tests

  // CRITICAL: JWT_SECRET is now required (no default fallback)
  JWT_SECRET: requireEnv("JWT_SECRET"),

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5137",
  BASE_URL: process.env.BASE_URL || "http://localhost:5138",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5137",
};
