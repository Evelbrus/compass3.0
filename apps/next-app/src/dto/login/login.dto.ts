import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export type LoginDto = z.infer<typeof LoginSchema>;
