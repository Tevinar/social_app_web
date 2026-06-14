import 'server-only';

import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { EnvVariable } from '@/core/config/env-variable';
import {
  normalizeUnknownException,
  parseServerExceptionResponseData,
} from '@/core/errors/exceptions-mapper';
import { NetworkException } from '@/core/errors/exceptions';

/**
 * Dependency-injection token for the shared server-side axios instance.
 */
export const SERVER_AXIOS = Symbol('SERVER_AXIOS');

/**
 * Creates the shared server-side axios instance used by remote data sources.
 */
export function createServerAxios(): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: trimTrailingSlash(requireApiBaseUrl()),
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | unknown) =>
      Promise.reject(normalizeAxiosError(error)),
  );

  return axiosInstance;
}

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

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function requireApiBaseUrl(): string {
  const apiBaseUrl = process.env[EnvVariable.ApiBaseUrl];

  if (!apiBaseUrl) {
    throw new Error(`${EnvVariable.ApiBaseUrl} is not configured`);
  }

  return apiBaseUrl;
}
