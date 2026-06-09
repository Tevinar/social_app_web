import type { Route } from 'next';

type AppRoutes = {
  home: Route;
  auth: {
    signIn: Route;
    signUp: Route;
    sessionCheck: Route;
  };
};

export const routes = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    sessionCheck: '/auth/session-check',
  },
} as const satisfies AppRoutes;
