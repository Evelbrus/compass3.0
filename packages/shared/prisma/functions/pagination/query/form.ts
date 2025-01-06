export function filterObject<T extends Record<string, any>>(
  input: T,
): {
  [K in keyof T as T[K] extends undefined | null | '' ? never : K]: T[K];
} {
  const result = {} as any;

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }

  return result;
}
