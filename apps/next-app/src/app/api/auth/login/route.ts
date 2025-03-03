import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { prisma } from '@shared/prisma/prisma-client';
import { LoginSchema } from 'src/dto/login/login.dto';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { createJWT } from '@shared/utils/parse-jwt/parseJwt';
import { getCookieOptions } from '@next-app/src/utils/get-cookie/getCookieOptions';

// Название куки для блокировки
const LOGIN_BLOCK_COOKIE = 'block';
// Максимальное количество попыток входа
const MAX_LOGIN_ATTEMPTS = 5;
// Время блокировки в минутах
const BLOCK_DURATION_MINUTES = 15;

// Маскирование email для безопасности
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

export async function POST(request: NextRequest) {
  try {
    // Проверка наличия секретов JWT
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      return NextResponse.json(
        { message: 'Ошибка конфигурации сервиса аутентификации. Обратитесь в службу поддержки.' },
        { status: 500 },
      );
    }

    // Проверка блокировки из куки
    const blockCookie = request.cookies.get(LOGIN_BLOCK_COOKIE);
    if (blockCookie) {
      try {
        const unlockTime = new Date(blockCookie.value);
        const currentTime = new Date();

        if (currentTime < unlockTime) {
          // Рассчитываем оставшееся время блокировки
          const remainingTimeMs = unlockTime.getTime() - currentTime.getTime();
          const remainingMinutes = Math.ceil(remainingTimeMs / 60000);

          return NextResponse.json(
            {
              message: `Слишком много попыток входа. Попробуйте снова через ${remainingMinutes} минут.`,
            },
            { status: 429 },
          );
        }
      } catch (e) {
        // Если не удалось распарсить куки, просто сбрасываем её
        console.error('Ошибка при чтении куки блокировки:', e);
      }
    }

    // Проверка типа контента
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ message: 'Неподдерживаемый тип данных' }, { status: 415 });
    }

    // Парсинг и валидация тела запроса
    const body = await request.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      // Перевод сообщений об ошибках валидации
      let errorMessage = validationResult.error.errors[0].message;
      if (errorMessage.includes('Required')) {
        errorMessage = 'Это поле обязательно для заполнения';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Некорректный формат email';
      }

      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // Получение IP-адреса и user-agent клиента
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Проверка ограничения по количеству попыток входа
    // Используем фиксированное значение MAX_LOGIN_ATTEMPTS вместо значения из конфигурации
    const windowMs = 15 * 60 * 1000; // 15 минут
    const attemptCount = await prisma.loginAttempt.count({
      where: {
        ip,
        createdAt: { gte: new Date(Date.now() - windowMs) },
      },
    });

    if (attemptCount >= MAX_LOGIN_ATTEMPTS) {
      // Создаем время разблокировки
      const blockDurationMs = BLOCK_DURATION_MINUTES * 60 * 1000;
      const unlockTime = new Date(Date.now() + blockDurationMs);

      // Создаем ответ с сообщением о блокировке
      const response = NextResponse.json(
        {
          message: `Слишком много попыток входа. Попробуйте снова через ${BLOCK_DURATION_MINUTES} минут.`,
        },
        { status: 429 },
      );

      // Устанавливаем куки блокировки - просто строковое значение даты
      response.cookies.set(LOGIN_BLOCK_COOKIE, unlockTime.toISOString(), {
        maxAge: blockDurationMs / 1000, // переводим в секунды для куки
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return response;
    }

    // Функция для записи неудачной попытки входа
    const recordFailedAttempt = async () => {
      try {
        const maskedEmailValue = maskEmail(email);

        // Создаем новую запись о попытке входа
        await prisma.loginAttempt.create({
          data: {
            ip,
            userAgent,
            emailAttempt: maskedEmailValue,
          },
        });

        // Проверяем, не достигнут ли лимит после добавления новой записи
        const newAttemptCount = await prisma.loginAttempt.count({
          where: {
            ip,
            createdAt: { gte: new Date(Date.now() - windowMs) },
          },
        });

        return newAttemptCount >= MAX_LOGIN_ATTEMPTS;
      } catch (err) {
        console.error('Ошибка при записи попытки входа:', err);
        return false;
      }
    };

    // Поиск пользователя по email без учета регистра
    console.log('Поиск пользователя в базе:', email);
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        uuid: true,
        email: true,
        password: true,
        role: true,
        isBlocked: true,
        availability: true,
        refreshTokens: true,
      },
    });
    console.log('Найден пользователь:', user);

    // Проверка существования пользователя
    if (!user) {
      const shouldBlock = await recordFailedAttempt();

      if (shouldBlock) {
        const blockDurationMs = BLOCK_DURATION_MINUTES * 60 * 1000;
        const unlockTime = new Date(Date.now() + blockDurationMs);

        const response = NextResponse.json(
          {
            message: `Слишком много попыток входа. Попробуйте снова через ${BLOCK_DURATION_MINUTES} минут.`,
          },
          { status: 429 },
        );

        response.cookies.set(LOGIN_BLOCK_COOKIE, unlockTime.toISOString(), {
          maxAge: blockDurationMs / 1000,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        return response;
      }

      return NextResponse.json(
        { message: 'Неверный email или пользователь не найден' },
        { status: 401 },
      );
    }

    // Инициализация массива refreshTokens
    const currentRefreshTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];

    // Проверка пароля
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password || '');
    } catch (err) {
      console.error('Ошибка при проверке пароля:', err);
    }

    if (!isPasswordValid) {
      const shouldBlock = await recordFailedAttempt();

      if (shouldBlock) {
        const blockDurationMs = BLOCK_DURATION_MINUTES * 60 * 1000;
        const unlockTime = new Date(Date.now() + blockDurationMs);

        const response = NextResponse.json(
          {
            message: `Слишком много попыток входа. Попробуйте снова через ${BLOCK_DURATION_MINUTES} минут.`,
          },
          { status: 429 },
        );

        response.cookies.set(LOGIN_BLOCK_COOKIE, unlockTime.toISOString(), {
          maxAge: blockDurationMs / 1000,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        return response;
      }

      return NextResponse.json({ message: 'Неверный пароль' }, { status: 401 });
    }

    // Проверка блокировки аккаунта
    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'Аккаунт временно заблокирован. Обратитесь в службу поддержки.' },
        { status: 403 },
      );
    }

    // Проверка доступности аккаунта
    if (user.availability === false) {
      return NextResponse.json(
        { message: 'Ваш аккаунт отключен. Пожалуйста, обратитесь в службу поддержки.' },
        { status: 403 },
      );
    }

    // Генерация нового значения refresh-токена
    const newRefreshTokenValue = uuidv4();

    // Управление массивом refresh-токенов (хранение только последних 5)
    const maxRefreshTokens = 5;
    const refreshTokensToKeep = [
      ...currentRefreshTokens.slice(-Math.max(0, maxRefreshTokens - 1)),
      newRefreshTokenValue,
    ];

    // Обновление пользователя: добавление нового refresh-токена и обновление lastActive
    await prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        refreshTokens: {
          set: refreshTokensToKeep,
        },
        lastActive: new Date(),
      },
    });

    // Генерация sessionId для сессии
    const sessionId = uuidv4();

    // Формирование payload для access-токена
    const accessTokenPayload = {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      sessionId,
    };

    // Создание JWT-токенов
    const accessToken = await createJWT(
      accessTokenPayload,
      authConfig.accessToken.secret,
      authConfig.accessToken.expiresIn,
    );

    // Формирование payload для refresh-токена
    const refreshTokenPayload = {
      uuid: user.uuid,
      sessionId,
      refreshToken: newRefreshTokenValue,
      loginAttemptId: null,
    };

    const refreshToken = await createJWT(
      refreshTokenPayload,
      authConfig.refreshToken.secret,
      authConfig.refreshToken.expiresIn,
    );

    // Создание ответа
    const response = NextResponse.json(
      {
        message: 'Вход выполнен успешно',
        user: {
          uuid: user.uuid,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );

    // Настройка cookies для токенов
    const cookieOptions = getCookieOptions(request);

    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: authConfig.accessToken.maxAge,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: authConfig.refreshToken.maxAge,
    });

    // При успешном входе удаляем куки блокировки, если она есть
    if (blockCookie) {
      response.cookies.set(LOGIN_BLOCK_COOKIE, '', {
        maxAge: 0,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    // Логирование ошибки
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

    // Возврат общего сообщения об ошибке
    return NextResponse.json(
      {
        message: 'Произошла ошибка при входе. Попробуйте позже.',
      },
      { status: 500 },
    );
  }
}
