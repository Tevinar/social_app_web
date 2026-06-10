import { render, screen } from '@testing-library/react';
import { AuthGradientButton } from '@/features/auth/client/presentation/components/auth-gradient-button';

describe('AuthGradientButton', () => {
  it('given an enabled button when rendered then it shows the button text', () => {
    render(<AuthGradientButton buttonText="Sign in" disabled={false} />);

    const button = screen.getByRole('button', { name: 'Sign in' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('given a disabled button when rendered then it shows the loading state', () => {
    render(<AuthGradientButton buttonText="Sign in" disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(button.querySelector('svg')).not.toBeNull();
  });
});
