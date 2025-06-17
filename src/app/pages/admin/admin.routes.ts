import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pages/admin/home/home.page').then(
        (m) => m.HomePage
      ),
  },
];

