import { Routes } from '@angular/router';
import { AdminGuard } from 'src/app/core/guards/adminGuard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pages/admin/home/home.page').then(
        (m) => m.HomePage
      ),
    canActivate: [AdminGuard],
  },
];

