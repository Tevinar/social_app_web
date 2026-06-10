import { render, screen, waitFor } from '@testing-library/react';
import { useActionState } from 'react';
import {
  authAttemptSources,
  authErrorCodes,
  authSearchParams,
} from '@/features/auth/neutral/constants/auth-search-params';
import { routes } from '@/shell/neutral/routes';
import { SignInForm } from '@/features/auth/client/presentation/components/sign-in-form';

const mockReplace = jest.fn();
const mockSearchParamGet = jest.fn();

// Keep real React behavior except for useActionState, which each test drives explicitly.
jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  useActionState: jest.fn(),
}));

// Stub router and search-param hooks so tests can control navigation inputs and inspect redirects.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockSearchParamGet,
  }),
}));

// Mock the server action module so the component can import it without pulling the real server dependency graph.
jest.mock('@/features/auth/server/actions/sign-in', () => ({
  signIn: jest.fn(),
}));

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamGet.mockReturnValue(null);
  });

  it('given an idle action state when rendered then it shows the sign-in fields and cross-link', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'idle', errorMessage: null },
      jest.fn(),
      false,
    ]);

    render(<SignInForm />);

    expect(
      screen.getByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeEnabled();
    expect(screen.getByLabelText('Password')).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute(
      'href',
      routes.auth.signUp,
    );
  });

  it('given an action error state when rendered then it shows the server-action error message', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'error', errorMessage: 'Invalid email or password.' },
      jest.fn(),
      false,
    ]);

    render(<SignInForm />);

    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('given a session-required auth error in the URL when rendered then it shows the cookie-persistence hint', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'idle', errorMessage: null },
      jest.fn(),
      false,
    ]);
    mockSearchParamGet.mockImplementation((key: string) =>
      key === authSearchParams.error ? authErrorCodes.sessionRequired : null,
    );

    render(<SignInForm />);

    expect(
      screen.getByText(
        'Authentication succeeded, but the session could not be saved. Please enable cookies and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('given a successful sign-in state when the effect runs then it redirects to the session-check page', async () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'success', errorMessage: null },
      jest.fn(),
      false,
    ]);

    render(<SignInForm />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        `${routes.auth.sessionCheck}?${authSearchParams.attempt}=${authAttemptSources.signIn}`,
      );
    });
  });

  it('given a pending action state when rendered then it disables the form controls', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'idle', errorMessage: null },
      jest.fn(),
      true,
    ]);

    render(<SignInForm />);

    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
