import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { prisma } from '@shared/prisma/prisma-client';
import { LoginSchema } from 'src/dto/login/login.dto';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { createJWT } from '@shared/utils/parse-jwt/parseJwt';

const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return 'invalid-email';
  const maskedName = name.slice(0, 2) + '*'.repeat(Math.max(0, name.length - 2));
  const [domainPart, ...tldParts] = domain.split('.');
  const maskedDomain = domainPart
    ? domainPart.slice(0, 2) + '*'.repeat(Math.max(0, domainPart.length - 2))
    : '*';
  return `${maskedName}@${maskedDomain}.${tldParts.join('.') || '*'}`;
};

const encryptData = async (data: string): Promise<string> => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('Encryption key not configured');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encodedData = new TextEncoder().encode(data);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedData);
  return Buffer.from(iv).toString('hex') + ':' + Buffer.from(encrypted).toString('hex');
};

export async function POST(request: NextRequest) {
  try {
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      throw new Error('JWT secrets not configured');
    }

    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ message: 'Unsupported media type' }, { status: 415 });
    }

    const body = await request.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = validationResult.data;

    //Получаем IP-адрес клиента
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const attemptCount = await prisma.loginAttempt.count({
      where: {
        ip,
        createdAt: { gte: new Date(Date.now() - authConfig.rateLimit.windowMs) },
      },
    });
    if (attemptCount >= authConfig.rateLimit.maxAttempts) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    }

    //Ищем пользователя по email
    console.log('Поиск пользователя в базе:', email);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        uuid: true,
        email: true,
        password: true,
        role: true,
        isBlocked: true,
        refreshTokens: true,
      },
    });
    console.log('Найден пользователь:', user);
    if (user) {
      user.refreshTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
    }

    //Проверяем корректность пароля
    const isPasswordValid = await bcrypt.compare(password, user?.password || '');
    if (!user || !isPasswordValid) {
      const maskedEmail = maskEmail(email);
      const encryptedEmail = await encryptData(maskedEmail);
      await prisma.loginAttempt.create({
        data: {
          ip,
          userAgent: request.headers.get('user-agent') || 'unknown',
          emailAttempt: encryptedEmail,
        },
      });
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'Account is temporarily locked. Contact support.' },
        { status: 403 },
      );
    }

    //Upsert записи LoginAttempt для данного пользователя (привязка к устройству)
    const loginAttemptRecord = await prisma.loginAttempt.upsert({
      where: { userId: user.uuid },
      update: {
        ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
      create: {
        ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
        emailAttempt: null,
        userId: user.uuid,
      },
    });
    const loginAttemptId = loginAttemptRecord.id;

    //Генерируем новое значение refresh-токена (UUID)
    const newRefreshTokenValue = uuidv4();

    //Обновляем пользователя: добавляем новый refresh-токен в массив и обновляем lastActive
    await prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        refreshTokens: {
          set: [...(user.refreshTokens || []), newRefreshTokenValue],
        },
        lastActive: new Date(),
      },
    });

    //Генерируем sessionId для сессии
    const sessionId = uuidv4();

    //Формируем payload для access-токена
    const accessTokenPayload = {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const accessToken = await createJWT(
      accessTokenPayload,
      authConfig.accessToken.secret,
      authConfig.accessToken.expiresIn,
    );

    //Формируем payload для refresh-токена
    const refreshTokenPayload = {
      uuid: user.uuid,
      sessionId,
      refreshToken: newRefreshTokenValue,
      loginAttemptId,
    };

    const refreshToken = await createJWT(
      refreshTokenPayload,
      authConfig.refreshToken.secret,
      authConfig.refreshToken.expiresIn,
    );

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          uuid: user.uuid,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );

    //Функция валидации домена для cookie
    const domainValidation = () => {
      if (process.env.NODE_ENV !== 'production') return undefined;
      if (!process.env.URL) return undefined;
      const url = new URL(process.env.URL);
      return url.hostname.replace('www.', '');
    };

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'https:',
      sameSite: 'lax' as const,
      path: '/',
      domain: domainValidation(),
    };

    //Устанавливаем accessToken и refreshToken в куки
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: authConfig.accessToken.maxAge,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: authConfig.refreshToken.maxAge,
    });

    //Заголовки безопасности
    response.headers.set('Access-Control-Allow-Origin', process.env.URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'none'; style-src 'self'",
    );
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    console.error(
      'Login error:',
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
        timestamp: new Date().toISOString(),
        endpoint: '/api/login',
        environment: process.env.NODE_ENV,
        ip: request.headers.get('x-forwarded-for'),
      }),
    );
    return NextResponse.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
        details: {
          code: 'server_error',
          suggestion: 'Contact support if problem persists',
        },
      },
      {
        status: 500,
        headers: { 'Content-Security-Policy': "default-src 'self'" },
      },
    );
  }
}
