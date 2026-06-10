import 'server-only';

import { serverDependencies } from '@/shell/server/dependencies';

/**
 * Returns the current authenticated user identifier stored in the encrypted
 * auth-session cookie.
 */
export function getCurrentUserId() {
  return serverDependencies.auth.getCurrentUserIdUseCase.execute();
}
