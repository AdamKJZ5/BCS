function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5000),

  MONGO_URI: requireEnv("MONGO_URI"),

  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: Number(requireEnv("SMTP_PORT")),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),

  OWNER_EMAIL: requireEnv("OWNER_EMAIL"),
  ADMIN_API_KEY: requireEnv("ADMIN_API_KEY"),
};
