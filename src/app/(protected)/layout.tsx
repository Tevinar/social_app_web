import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { routes } from '@/shell/neutral/routes';
import { getCurrentUserId } from '@/shell/server/session/get-current-user-id';

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const currentUserIdResult = await getCurrentUserId();

  if (currentUserIdResult.isErr() || currentUserIdResult.value === null) {
    redirect(routes.auth.signIn);
  }

  return children;
}
