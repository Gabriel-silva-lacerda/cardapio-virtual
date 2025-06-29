import { Routes } from '@angular/router';
import { AuthParamGuard } from './core/guards/authParamGuad';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'planos',
    pathMatch: 'full',

  },
  {
    path: 'planos',
    loadChildren: () =>
      import('./core/pages/plans/plans.routes').then((m) => m.plansRoutes),
  },
  {
    path: 'auth/:companyName',
    loadComponent: () =>
      import('./core/layout/auth/auth.component').then((m) => m.AuthComponent),
    canActivate: [AuthParamGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./domain/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./core/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
    ],
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./core/pages/main/main.component').then((m) => m.MainComponent),
    canActivate: [],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./core/pages/main/main.routes').then((m) => m.mainRoutes),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/pages/not-found/not-found.page').then(
        (m) => m.NotFoundPage
      ),
  },
];
