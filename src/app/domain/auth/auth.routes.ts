import { Routes } from '@angular/router';
import { AuthAccessGuard } from 'src/app/core/guards/authAccessGuard';
import { isLoggedGuard } from 'src/app/core/guards/isLoggedGuard';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [isLoggedGuard],
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up.component').then((m) => m.SignUpComponent),
    canActivate: [isLoggedGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>  import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [isLoggedGuard],
  }
];
