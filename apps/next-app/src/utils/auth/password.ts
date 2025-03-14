// src/utils/auth/password.ts
import bcrypt from 'bcrypt';
import debug from 'debug';

const logError = debug('app:password-utils:error');
const SALT_ROUNDS = 10;

/**
 * Хеширует пароль с использованием bcrypt
 * @param password Строка с паролем
 * @returns Обещание с хешированным паролем
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  } catch (error) {
    logError('× Ошибка при хешировании пароля:', error);
    throw new Error('Не удалось хешировать пароль');
  }
}

/**
 * Сравнивает обычный пароль с хешированным
 * @param plainPassword Обычный пароль (введенный пользователем)
 * @param hashedPassword Хешированный пароль (из базы данных)
 * @returns Обещание с результатом сравнения (true/false)
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logError('× Ошибка при сравнении паролей:', error);
    throw new Error('Не удалось сравнить пароли');
  }
}
