import { Routes } from '@angular/router';
import { AdminGuard } from '@core/guards/adminGuard';
import { AdminRedirectGuard } from '@core/guards/adminRedirectGuard';
import { CompanyNameGuard } from '@core/guards/companyNameGuard';

export const mainRoutes: Routes = [
  {
    path: ':companyName',
    canActivate: [CompanyNameGuard],
    children: [
      {
        path: '',
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
    ],
  }
];
