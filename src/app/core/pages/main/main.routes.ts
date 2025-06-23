import { Routes } from '@angular/router';
import { AdminGuard } from '@core/guards/adminGuard';
import { AdminRedirectGuard } from '@core/guards/paymentRedirectGuard';

export const mainRoutes: Routes = [
  {
    path: ':companyName',
    loadChildren: () =>
      import('../../../pages/client/client.routes').then((m) => m.ClienteRoutes),
    canActivate: [AdminRedirectGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('../../../pages/admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [AdminGuard],
  },
];
