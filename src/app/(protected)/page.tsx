import { SignOutButton } from '@/features/blog/client/presentation/components/sign-out-button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary-background">
      <div className="flex flex-col items-center gap-4 rounded-[28px] bg-white px-8 py-10 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-semibold text-background">Blog list</h1>
        <p className="text-sm text-grey">
          Placeholder page while the blog UI is being built.
        </p>
        <SignOutButton />
      </div>
    </main>
  );
}
