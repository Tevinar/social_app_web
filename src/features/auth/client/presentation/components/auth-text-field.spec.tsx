import { render, screen } from '@testing-library/react';
import { AuthTextField } from '@/features/auth/client/presentation/components/auth-text-field';

describe('AuthTextField', () => {
  it('given field props when rendered then it exposes the expected labeled input attributes', () => {
    render(
      <AuthTextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
      />,
    );

    const input = screen.getByLabelText('Email');

    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('placeholder', 'name@example.com');
    expect(input).toBeRequired();
    expect(input).toBeEnabled();
  });

  it('given a disabled field when rendered then it disables the input', () => {
    render(
      <AuthTextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        disabled
      />,
    );

    expect(screen.getByLabelText('Password')).toBeDisabled();
  });
});
