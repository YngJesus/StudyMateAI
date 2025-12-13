import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  // Home page (landing page) - Public route
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },

  // Auth routes (login, signup) - only accessible when NOT logged in
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup').then((m) => m.SignupComponent),
      },
    ],
  },

  // Protected routes - wrapped in layout with sidebar and navbar
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./features/subjects/subjects/subjects').then((m) => m.Subjects),
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat/chat').then((m) => m.Chat),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar/calendar').then((m) => m.Calendar),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  // {
  //   path: 'subjects/:id',
  //   loadComponent: () => import('./features/subjects/subjects/subjects').then((m) => m.Subjects),
  // },

  // Wildcard route - redirect to home
  {
    path: '**',
    redirectTo: '',
  },
];
