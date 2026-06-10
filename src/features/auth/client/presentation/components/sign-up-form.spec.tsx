import { render, screen, waitFor } from '@testing-library/react';
import { useActionState } from 'react';
import {
  authAttemptSources,
  authErrorCodes,
  authSearchParams,
} from '@/features/auth/neutral/constants/auth-search-params';
import { routes } from '@/shell/neutral/routes';
import { SignUpForm } from '@/features/auth/client/presentation/components/sign-up-form';

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
jest.mock('@/features/auth/server/actions/sign_up', () => ({
  signUp: jest.fn(),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamGet.mockReturnValue(null);
  });

  it('given an idle action state when rendered then it shows the sign-up fields and cross-link', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'idle', errorMessage: null },
      jest.fn(),
      false,
    ]);

    render(<SignUpForm />);

    expect(
      screen.getByRole('heading', { name: 'Sign up' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeEnabled();
    expect(screen.getByLabelText('Email')).toBeEnabled();
    expect(screen.getByLabelText('Password')).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute(
      'href',
      routes.auth.signIn,
    );
  });

  it('given an action error state when rendered then it shows the server-action error message', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'error', errorMessage: 'Email already in use.' },
      jest.fn(),
      false,
    ]);

    render(<SignUpForm />);

    expect(screen.getByText('Email already in use.')).toBeInTheDocument();
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

    render(<SignUpForm />);

    expect(
      screen.getByText(
        'Authentication succeeded, but the session could not be saved. Please enable cookies and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('given a successful sign-up state when the effect runs then it redirects to the session-check page', async () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'success', errorMessage: null },
      jest.fn(),
      false,
    ]);

    render(<SignUpForm />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        `${routes.auth.sessionCheck}?${authSearchParams.attempt}=${authAttemptSources.signUp}`,
      );
    });
  });

  it('given a pending action state when rendered then it disables the form controls', () => {
    (useActionState as jest.Mock).mockReturnValue([
      { status: 'idle', errorMessage: null },
      jest.fn(),
      true,
    ]);

    render(<SignUpForm />);

    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
