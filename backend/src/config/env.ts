import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];
  const missing = requiredEnvVars.filter((key) => !process.env[key] || process.env[key]?.trim() === '');
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const insecureSecrets = ['supersecret_access_key', 'supersecret_refresh_key', 'secret', 'password', 'changeme'];
  if (
    insecureSecrets.includes(process.env.JWT_SECRET!.trim()) ||
    insecureSecrets.includes(process.env.JWT_REFRESH_SECRET!.trim())
  ) {
    console.error('[FATAL] Insecure default secrets detected in production environment variables.');
    process.exit(1);
  }

  if (process.env.MONGO_URI!.includes('localhost') || process.env.MONGO_URI!.includes('127.0.0.1')) {
    console.error('[FATAL] MONGO_URI cannot point to localhost/127.0.0.1 in production.');
    process.exit(1);
  }
}

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5005,
  nodeEnv,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ba_odyssey',
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret_access_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecret_refresh_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
