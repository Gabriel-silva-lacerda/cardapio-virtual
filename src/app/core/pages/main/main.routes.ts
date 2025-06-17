import { Routes } from '@angular/router';

export const mainRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../../../pages/client/client.routes').then((m) => m.ClienteRoutes),
    canActivate: [],

  },
  {
    path: 'admin',
    loadChildren: () =>
      import('../../../pages/admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [],
  },
];
