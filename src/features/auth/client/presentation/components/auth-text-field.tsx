'use client';

type AuthTextFieldProps = {
  readonly label: string;
  readonly name: string;
  readonly type: 'email' | 'password' | 'text';
  readonly autoComplete: string;
  readonly placeholder: string;
  readonly disabled?: boolean;
};

/**
 * Shared labeled text field for auth forms.
 */
export function AuthTextField({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  disabled = false,
}: AuthTextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-md font-medium text-white">{label}</span>
      <input
        required
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 rounded-[10px] border-[3px] border-border bg-background px-5 py-7 text-md text-white outline-none transition focus:border-gradient-2 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}
