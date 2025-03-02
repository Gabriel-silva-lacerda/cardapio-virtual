import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
];
