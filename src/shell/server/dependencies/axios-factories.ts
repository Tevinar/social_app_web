import 'server-only';

import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { EnvVariable } from '@/core/config/env-variable';
import {
  normalizeUnknownException,
  parseServerExceptionResponseData,
} from '@/core/errors/exceptions-mapper';
import { NetworkException } from '@/core/errors/exceptions';
import { attachAuthAxiosInterceptor } from '@/features/auth/server/data/network/auth-axios-interceptor';
import { AuthTokenManager } from '@/features/auth/server/data/session/auth-token-manager';

/**
 * Dependency-injection token for the public server-side axios instance.
 */
export const PUBLIC_SERVER_AXIOS = Symbol('PUBLIC_SERVER_AXIOS');

/**
 * Dependency-injection token for the authenticated server-side axios instance.
 */
export const AUTHED_SERVER_AXIOS = Symbol('AUTHED_SERVER_AXIOS');

/**
 * Creates the public server-side axios instance used by auth endpoints and
 * other unauthenticated backend requests.
 */
export function createPublicServerAxios(): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: trimTrailingSlash(requireApiBaseUrl()),
  });

  attachNormalizedErrorInterceptor(axiosInstance);
  return axiosInstance;
}

/**
 * Creates the authenticated server-side axios instance used by protected
 * backend requests.
 */
export function createAuthedServerAxios(params: {
  authTokenManager: AuthTokenManager;
}): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: trimTrailingSlash(requireApiBaseUrl()),
  });

  attachAuthAxiosInterceptor({
    axiosInstance,
    authTokenManager: params.authTokenManager,
  });
  attachNormalizedErrorInterceptor(axiosInstance);

  return axiosInstance;
}

/**
 * Attaches the shared response interceptor that converts low-level axios
 * failures into the app exception hierarchy.
 */
function attachNormalizedErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | unknown) =>
      Promise.reject(normalizeAxiosError(error)),
  );
}

/**
 * Normalizes one axios failure into the app's internal exception model.
 */
function normalizeAxiosError(error: AxiosError | unknown): Error {
  if (!axios.isAxiosError(error)) {
    return normalizeUnknownException(error);
  }

  if (error.response !== undefined) {
    return parseServerExceptionResponseData(error.response.data);
  }

  if (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.message === 'Network Error'
  ) {
    return new NetworkException({
      message: error.message || 'Network request failed',
    });
  }

  return normalizeUnknownException(error);
}

/**
 * Removes the trailing slash from one base URL so relative request paths are
 * appended consistently.
 */
function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/**
 * Returns the configured backend base URL or throws when it is missing.
 */
function requireApiBaseUrl(): string {
  const apiBaseUrl = process.env[EnvVariable.ApiBaseUrl];

  if (!apiBaseUrl) {
    throw new Error(`${EnvVariable.ApiBaseUrl} is not configured`);
  }

  return apiBaseUrl;
}
