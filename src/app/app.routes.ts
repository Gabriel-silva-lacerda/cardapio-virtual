import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./core/layout/auth/auth.component').then((m) => m.AuthComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./domain/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./core/pages/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
      }
    ],
  },

];
