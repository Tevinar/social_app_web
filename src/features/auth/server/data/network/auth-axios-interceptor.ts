import 'server-only';

import axios, {
  type AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { UnauthorizedException } from '@/core/errors/exceptions';
import { AuthTokenManager } from '@/features/auth/server/data/session/auth-token-manager';

type RetriableAxiosRequestConfig = InternalAxiosRequestConfig & {
  __authRetryDone?: boolean;
};

/**
 * Attaches the authenticated request/refresh behavior to one axios instance.
 */
export function attachAuthAxiosInterceptor(params: {
  axiosInstance: AxiosInstance;
  authTokenManager: AuthTokenManager;
}): void {
  params.axiosInstance.interceptors.request.use(async (config) => {
    const accessToken = await params.authTokenManager.getValidAccessToken();

    if (accessToken === null) {
      throw new UnauthorizedException({
        message: 'Missing auth session',
      });
    }

    setAuthorizationHeader(config, accessToken);
    return config;
  });

  params.axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | unknown) => {
      // Only authentication failures should trigger a refresh-and-retry flow.
      if (!isRetryableAuthError(error)) {
        return Promise.reject(error);
      }

      const requestConfig = error.config as RetriableAxiosRequestConfig;

      // Stop after one retry so a permanently invalid session cannot loop
      // forever on repeated 401/403 responses.
      if (requestConfig.__authRetryDone === true) {
        return Promise.reject(error);
      }

      try {
        // Force a session refresh when the backend rejected the bearer token,
        // then replay the original request once with the rotated token.
        const refreshedAccessToken =
          await params.authTokenManager.forceRefreshAccessToken();

        requestConfig.__authRetryDone = true;
        setAuthorizationHeader(requestConfig, refreshedAccessToken);

        return await params.axiosInstance.request(requestConfig);
      } catch {
        // If refresh itself fails, surface the original auth error to the
        // caller instead of masking it with a second failure.
        return Promise.reject(error);
      }
    },
  );
}

/**
 * Returns whether one axios failure qualifies for a single auth-refresh retry.
 */
function isRetryableAuthError(error: unknown): error is AxiosError {
  return (
    axios.isAxiosError(error) &&
    error.config !== undefined &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}

/**
 * Writes the current bearer token into the request authorization header.
 */
function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  accessToken: string,
): void {
  const headers = AxiosHeaders.from(config.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  config.headers = headers;
}
