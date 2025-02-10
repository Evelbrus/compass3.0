import { jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

//Определите интерфейс для структуры JWT payload
export interface JWTPayload {
  uuid: string;
  role: string;
  email: string;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    return {
      uuid: (payload as JoseJWTPayload).uuid as string,
      role: (payload as JoseJWTPayload).role as string,
      email: (payload as JoseJWTPayload).email as string,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid token');
  }
}
