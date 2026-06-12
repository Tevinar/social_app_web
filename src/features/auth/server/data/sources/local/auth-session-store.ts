import 'server-only';

import { EnvVariable } from '@/core/config/env-variable';
import { requireSecretFile } from '@/core/config/read-secret-file';
import { InvalidResponseException } from '@/core/errors/exceptions';
import { JsonReader } from '@/core/serialization/json-reader';
import { authCookies } from '@/features/auth/neutral/constants/auth-cookies';
import { AuthSessionModel } from '@/features/auth/server/data/models/auth-session-model';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import { Environment } from '@/core/config/environment';

/**
 * Dependency-injection token for `AuthSessionStore`.
 */
export const AUTH_SESSION_STORE = Symbol('AUTH_SESSION_STORE');

/**
 * Local store for the authenticated session cookie.
 */
export interface AuthSessionStore {
  /**
   * Returns the persisted auth session, or `null` when no session exists.
   */
  getSession(): Promise<AuthSessionModel | null>;

  /**
   * Persists `session` as the current authenticated session.
   */
  saveSession(session: AuthSessionModel): Promise<void>;

  /**
   * Removes the persisted authenticated session.
   */
  clearSession(): Promise<void>;
}

/**
 * Encrypted-cookie backed implementation of `AuthSessionStore`.
 */
export class EncryptedCookieAuthSessionStore implements AuthSessionStore {
  async getSession(): Promise<AuthSessionModel | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(authCookies.session)?.value;
    if (!raw) {
      return null;
    }

    return this.decryptSession(
      raw,
      requireSecretFile(AUTH_SESSION_SECRET_FILE_NAME),
    );
  }

  async saveSession(session: AuthSessionModel): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(
      authCookies.session,
      await this.encryptSession(
        session,
        requireSecretFile(AUTH_SESSION_SECRET_FILE_NAME),
      ),
      {
        httpOnly: true,
        secure:
          process.env[EnvVariable.AppEnv] === Environment.Production ||
          process.env[EnvVariable.AppEnv] === Environment.Staging,
        sameSite: 'lax',
        path: '/',
        expires: session.refreshTokenExpiresAt,
      },
    );
  }

  async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(authCookies.session);
  }

  /**
   * Encrypts one authenticated session model into the cookie payload format.
   */
  private async encryptSession(
    session: AuthSessionModel,
    secret: string,
  ): Promise<string> {
    return new EncryptJWT(session.toJson())
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime(session.refreshTokenExpiresAt)
      .encrypt(this.deriveKey(secret));
  }

  /**
   * Decrypts one stored cookie payload into an authenticated session model.
   */
  private async decryptSession(
    value: string,
    secret: string,
  ): Promise<AuthSessionModel> {
    try {
      const { payload } = await jwtDecrypt(value, this.deriveKey(secret), {
        keyManagementAlgorithms: ['dir'],
        contentEncryptionAlgorithms: ['A256GCM'],
      });

      const json = payload as unknown;
      return AuthSessionModel.fromJson(
        JsonReader.asObject(json, 'session', 'Stored auth session cookie'),
      );
    } catch {
      throw new InvalidResponseException({
        message: 'Stored auth session cookie is invalid',
      });
    }
  }

  /**
   * Derives the fixed 256-bit symmetric key used by jose to encrypt and
   * decrypt cookie payloads.
   */
  private deriveKey(secret: string): Uint8Array {
    return createHash('sha256').update(secret, 'utf8').digest();
  }
}

/**
 * Secret file that stores the encryption key used to protect the auth-session
 * cookie payload.
 */
const AUTH_SESSION_SECRET_FILE_NAME = 'auth_session_secret.txt';
