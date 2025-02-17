import { jwtVerify, SignJWT } from 'jose';
export function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            throw new Error('Invalid JWT token');
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''));
        return JSON.parse(jsonPayload);
    }
    catch (error) {
        console.error('Failed to parse JWT:', error);
        return null;
    }
}
/**
 * Универсальная функция верификации JWT
 * @param token - JWT токен
 * @param secret - секретный ключ
 * @returns Декодированный payload
 */
export async function verifyJWT(token, secret) {
    try {
        if (!token)
            throw new Error('JWT token is empty');
        token = token.trim();
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });
        return payload;
    }
    catch (error) {
        console.error('[JWT] Verification error:', error);
        throw new Error('Invalid token');
    }
}
/**
 * Универсальная функция для создания JWT
 * @param payload - Данные, которые нужно закодировать в токен
 * @param secret - Секретный ключ
 * @param expiresIn - Время жизни токена (например, "1h", "7d")
 * @returns Подписанный JWT токен
 */
export async function createJWT(payload, secret, expiresIn) {
    const secretKey = new TextEncoder().encode(secret);
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secretKey);
}
