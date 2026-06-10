import { Loader } from '@/core/ui/loader';
import { SignInForm } from '@/features/auth/client/presentation/components/sign-in-form';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary-background">
      {/* Suspense is mandatory because SignInForm contains useSearchParams, which 
      which can trigger a client-side rendering bailout during static prerendering 
      and therefore must be isolated behind a Suspense boundary.*/}
      <Suspense fallback={<Loader />}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
