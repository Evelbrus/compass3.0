// src/utils/authenticateRequest.ts
import { NextRequest } from 'next/server'
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt'
import { authConfig } from '@shared/utils/cookie/get-cookie/auth'
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie'
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  uuid: string
  role?: string
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Проверяет токен из запроса и, если передан список allowedRoles, сверяет роль пользователя.
 * Если токен недействительный или роль не входит в allowedRoles, выбрасывается ошибка.
 */
export async function authenticateRequest(
  req: NextRequest,
  allowedRoles?: UserRole[],
): Promise<JwtPayload> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    throw new Error('Unauthorized')
  }
  try {
    const token = await verifyJWT<JwtPayload>(accessToken, authConfig.accessToken.secret)
    if (!token || !token.uuid) {
      throw new Error('Unauthorized')
    }
    if (allowedRoles && allowedRoles.length > 0) {
      if (!token.role || !allowedRoles.includes(token.role as UserRole)) {
        throw new Error('Unauthorized')
      }
    }
    return token
  } catch (error) {
    throw new Error('Unauthorized')
  }
}
