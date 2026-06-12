import 'server-only';

import * as Sentry from '@sentry/nextjs';
import pino, { stdTimeFunctions, type Logger } from 'pino';
import { Environment } from '@/core/config/environment';
import { EnvVariable } from '@/core/config/env-variable';
import { LogLevel } from '@/core/config/log-level';

export type AppLogData = Record<string, unknown>;

export type PinoAppLoggerErrorParams = {
  data?: AppLogData;
  error?: unknown;
};

/**
 * Pino-backed server logger that also forwards error-level events to Sentry.
 */
export class PinoAppLogger {
  private readonly logger: Logger = pino({
    name: 'social-app-web',
    level: process.env[EnvVariable.LogLevel] as LogLevel,
    timestamp: stdTimeFunctions.isoTime,
    base: {
      service: 'social-app-web',
      runtime: 'next-server',
    },
    redact: {
      paths: [
        'password',
        'accessToken',
        'refreshToken',
        'authorization',
        'cookie',
        'set-cookie',
        'headers.authorization',
        'headers.cookie',
      ],
      censor: '[REDACTED]',
    },
    ...(process.env[EnvVariable.AppEnv] === Environment.Production
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
            },
          },
        }),
  });

  debug(message: string, data?: AppLogData): void {
    this.logger.debug(data ?? {}, message);
  }

  info(message: string, data?: AppLogData): void {
    this.logger.info(data ?? {}, message);
  }

  warning(message: string, data?: AppLogData): void {
    this.logger.warn(data ?? {}, message);
  }

  error(message: string, params?: PinoAppLoggerErrorParams): void {
    let normalizedError: Error | undefined;

    if (params?.error instanceof Error) {
      normalizedError = params.error;
    } else if (params?.error !== undefined) {
      normalizedError = new Error(String(params.error));
    }

    this.logger.error(
      {
        ...(normalizedError ? { err: normalizedError } : {}),
        ...(params?.data ?? {}),
      },
      message,
    );

    if (normalizedError) {
      const captureContext: { extra?: AppLogData } = {};

      if (params?.data !== undefined) {
        captureContext.extra = params.data;
      }

      Sentry.captureException(normalizedError, captureContext);
      return;
    }

    const captureContext: { level: 'error'; extra?: AppLogData } = {
      level: 'error',
    };

    if (params?.data !== undefined) {
      captureContext.extra = params.data;
    }

    Sentry.captureMessage(message, captureContext);
  }
}
