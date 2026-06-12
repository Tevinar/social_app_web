import 'server-only';

import { GetCurrentUserIdUseCase } from '@/features/auth/server/domain/usecases/get-current-user-id.usecase';
import { serverContainer } from '@/shell/server/init-dependencies';

/**
 * Returns the current authenticated user identifier stored in the encrypted
 * auth-session cookie.
 */
export function getCurrentUserId() {
  return serverContainer.resolve(GetCurrentUserIdUseCase).execute();
}
