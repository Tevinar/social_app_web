'use client';
import { Loader } from '@/core/ui/loader';

type AuthGradientButtonProps = {
  readonly buttonText: string;
  readonly disabled: boolean;
};

/**
 * Gradient auth button shared by sign-in and sign-up forms.
 */
export function AuthGradientButton({
  buttonText,
  disabled,
}: AuthGradientButtonProps) {
  return (
    <button
      aria-busy={disabled}
      disabled={disabled}
      type="submit"
      className="h-13.75 w-full font-semibold text-white transition rounded-[10px] bg-linear-to-tr from-gradient-1 to-gradient-2"
    >
      {disabled ? (
        <span className="flex justify-center">
          <Loader />
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
}
