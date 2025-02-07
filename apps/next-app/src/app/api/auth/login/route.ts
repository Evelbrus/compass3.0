///api/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { prisma } from '@shared/prisma/prisma-client';
import { LoginSchema } from 'src/dto/login/login.dto';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';

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

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const attemptCount = await prisma.loginAttempt.count({
      where: {
        ip,
        createdAt: {
          gte: new Date(Date.now() - authConfig.rateLimit.windowMs),
        },
      },
    });

    if (attemptCount >= authConfig.rateLimit.maxAttempts) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        uuid: true,
        email: true,
        password: true,
        role: true,
        isBlocked: true,
        refreshTokens: true,
        sessionVersion: true,
      },
    });

    //Проверяем пароль с помощью bcryptjs
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

    //Генерация нового refreshToken
    const newRefreshToken = uuidv4();

    //Обновляем пользователя: добавляем новый refreshToken в массив и увеличиваем sessionVersion
    const updatedUser = await prisma.$transaction(async (tx) => {
      return await tx.user.update({
        where: { uuid: user.uuid },
        data: {
          refreshTokens: {
            push: newRefreshToken,
          },
          lastActive: new Date(),
          sessionVersion: { increment: 1 },
        },
        select: {
          sessionVersion: true,
          refreshTokens: true,
        },
      });
    });

    //Генерация accessToken
    const accessTokenSecret = new TextEncoder().encode(authConfig.accessToken.secret);
    const refreshTokenSecret = new TextEncoder().encode(authConfig.refreshToken.secret);
    const sessionId = uuidv4();

    const accessToken = await new SignJWT({
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      sessionId,
      sessionVersion: updatedUser.sessionVersion,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(authConfig.accessToken.expiresIn)
      .sign(accessTokenSecret);

    //Генерация refreshToken (JWT)
    const refreshToken = await new SignJWT({
      uuid: user.uuid,
      sessionId,
      sessionVersion: updatedUser.sessionVersion,
      refreshToken: newRefreshToken,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(authConfig.refreshToken.expiresIn)
      .sign(refreshTokenSecret);

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

    const domainValidation = () => {
      if (process.env.NODE_ENV !== 'production') return undefined;
      if (!process.env.NEXTAUTH_URL) return undefined;

      const url = new URL(process.env.NEXTAUTH_URL);
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
    response.headers.set('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
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
        headers: {
          'Content-Security-Policy': "default-src 'self'",
        },
      },
    );
  }
}
