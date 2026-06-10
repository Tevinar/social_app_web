import 'server-only';

/**
 * Reads one FormData entry as a plain string.
 *
 * Non-string entries such as File objects are treated as missing values.
 */
export function readFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value : '';
}
