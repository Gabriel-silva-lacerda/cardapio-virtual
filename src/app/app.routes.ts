import { HomeListarComponent } from './pages/home/home-listar/home-listar.component';
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
  {
    path: '',
    loadComponent: () => import('./core/pages/main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./core/pages/main/main.routes').then((m) => m.mainRoutes),
      },
      {
        path: 'planos', // Rota pública para a landing page de planos
        loadChildren: () => import('./core/pages/plans/plans.routes').then((m) => m.plansRoutes),
      },
    ]
  },
];
