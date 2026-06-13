import type { Failure } from '@/core/errors/failures';
import type { Result } from 'neverthrow';

/**
 * Shared contract for a one-shot use case that requires input parameters.
 */
export interface UseCase<Success, Params> {
  /**
   * Executes the use case with the provided input parameters.
   */
  execute(params: Params): Promise<Result<Success, Failure>>;
}

/**
 * Shared contract for a one-shot use case that requires no input parameters.
 */
export interface NoParamsUseCase<Success> {
  /**
   * Executes the use case.
   */
  execute(): Promise<Result<Success, Failure>>;
}
