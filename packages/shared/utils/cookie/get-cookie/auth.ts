export interface TokenConfig {
  secret: string;
  expiresIn: string;
  maxAge: number;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMinutes?: number;
}

export interface AuthConfig {
  accessToken: TokenConfig;
  refreshToken: TokenConfig;
  rateLimit: RateLimitConfig;
}

function validateAuthConfig(config: AuthConfig) {
  if (!config.accessToken.secret || config.accessToken.secret === 'access_secret') {
    throw new Error('ACCESS_TOKEN_SECRET is not properly configured');
  }

  if (!config.refreshToken.secret || config.refreshToken.secret === 'refresh_secret') {
    throw new Error('REFRESH_TOKEN_SECRET is not properly configured');
  }

  if (process.env.NODE_ENV === 'production') {
    if (config.accessToken.secret === 'access_secret') {
      throw new Error('Insecure default access token secret in production');
    }
    if (config.rateLimit.maxAttempts < 3) {
      throw new Error('Rate limit maxAttempts too low for production');
    }
  }

  if (config.rateLimit.windowMs < 60000) {
    throw new Error('Rate limit window must be at least 1 minute');
  }
}

export const authConfig: AuthConfig = {
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET || 'access_secret',
    expiresIn: '2m',
    maxAge: 2 * 60,
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
    expiresIn: '7d',
    maxAge: 7 * 24 * 60 * 60,
  },
  rateLimit: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5', 10),
    windowMs: 15 * 60 * 1000,
    blockDurationMinutes: 30,
  },
};

validateAuthConfig(authConfig);
