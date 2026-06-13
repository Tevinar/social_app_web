import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Reads one optional secret file from the local `.secrets` directory.
 *
 * @param name Basename of the secret file to read from `.secrets/`.
 * @returns The trimmed secret file contents, or `undefined` when the file does
 * not exist.
 */
export function readOptionalSecretFile(name: string): string | undefined {
  try {
    return readFileSync(join(process.cwd(), '.secrets', name), 'utf8').trim();
  } catch {
    return undefined;
  }
}

/**
 * Reads one required secret file from the local `.secrets` directory and fails
 * fast when it is missing.
 *
 * @param name Basename of the secret file to read from `.secrets/`.
 * @returns The trimmed secret file contents.
 */
export function requireSecretFile(name: string): string {
  const secret = readOptionalSecretFile(name);

  if (secret === undefined) {
    throw new Error(`Missing required secret file: .secrets/${name}`);
  }

  return secret;
}
