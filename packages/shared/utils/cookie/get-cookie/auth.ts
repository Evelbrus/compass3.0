export interface TokenConfig {
  secret: string;
  expiresIn: string;
  maxAge: number;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMinutes: number;
}

export interface AuthConfig {
  accessToken: TokenConfig;
  refreshToken: TokenConfig;
  rateLimit: RateLimitConfig;
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  const [_, value, unit] = match;
  const multipliers: { [key: string]: number } = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(value) * (multipliers[unit] || 1);
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
    secret: (process.env.ACCESS_TOKEN_SECRET || 'access_secret').trim(),
    expiresIn: '2m',
    maxAge: parseDuration('2m'),
  },
  refreshToken: {
    secret: (process.env.REFRESH_TOKEN_SECRET || 'refresh_secret').trim(),
    expiresIn: '7d',
    maxAge: parseDuration('7d'),
  },
  rateLimit: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (15 * 60 * 1000).toString(), 10),
    blockDurationMinutes: parseInt(process.env.BLOCK_DURATION_MINUTES || '30', 10),
  },
};

//Добавь логирование
console.log('ACCESS_TOKEN_SECRET:', authConfig.accessToken.secret);
console.log('REFRESH_TOKEN_SECRET:', authConfig.refreshToken.secret);

validateAuthConfig(authConfig);
