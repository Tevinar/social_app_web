import { SignInForm } from '@/features/auth/client/presentation/components/sign-in-form';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center --color-secondary-background">
      <SignInForm />
    </main>
  );
}
