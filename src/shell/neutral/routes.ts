import type { Route } from 'next';

type AppRoutes = {
  home: Route;
  auth: {
    signIn: Route;
    signUp: Route;
  };
};

export const routes = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
  },
} as const satisfies AppRoutes;
