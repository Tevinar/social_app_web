import { SignUpForm } from '@/features/auth/client/presentation/components/sign-up-form';
import { Loader } from 'lucide-react';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary-background">
      {/* Suspense is mandatory because SignUpForm contains useSearchParams, which 
            which can trigger a client-side rendering bailout during static prerendering 
            and therefore must be isolated behind a Suspense boundary.*/}
      <Suspense fallback={<Loader />}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}
