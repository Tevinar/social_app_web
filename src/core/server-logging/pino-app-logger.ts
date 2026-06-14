import 'server-only';

import * as Sentry from '@sentry/nextjs';
import pino, { stdTimeFunctions, type Logger } from 'pino';
import { Environment } from '@/core/config/environment';
import { EnvVariable } from '@/core/config/env-variable';
import { LogLevel } from '@/core/config/log-level';

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

  /**
   * Writes one debug-level log entry.
   *
   * @param message Human-readable log message.
   * @param data Optional structured log payload.
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.logger.debug(data ?? {}, message);
  }

  /**
   * Writes one info-level log entry.
   *
   * @param message Human-readable log message.
   * @param data Optional structured log payload.
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.logger.info(data ?? {}, message);
  }

  /**
   * Writes one warning-level log entry.
   *
   * @param message Human-readable log message.
   * @param data Optional structured log payload.
   */
  warning(message: string, data?: Record<string, unknown>): void {
    this.logger.warn(data ?? {}, message);
  }

  /**
   * Writes one error-level log entry and forwards it to Sentry.
   *
   * @param message Human-readable log message.
   * @param error Optional thrown value associated with the log entry.
   */
  error(message: string, error?: unknown): void {
    let normalizedError: Error | undefined;

    if (error instanceof Error) {
      normalizedError = error;
    } else if (error !== undefined) {
      normalizedError = new Error(String(error));
    }

    this.logger.error(normalizedError ? { err: normalizedError } : {}, message);

    if (normalizedError) {
      Sentry.captureException(normalizedError);
      return;
    }

    const captureContext: Sentry.CaptureContext = {
      level: 'error',
    };

    Sentry.captureMessage(message, captureContext);
  }
}
