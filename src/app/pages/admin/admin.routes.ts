import { Routes } from '@angular/router';
import { AdminGuard } from 'src/app/core/guards/adminGuard';

export const adminRoutes: Routes = [
  {
    path: ':companyName',  // <-- aqui você define o slug como parâmetro
    loadComponent: () =>
      import('../admin/home/home-page/home.page').then(
        (m) => m.HomePage
      ),
    canActivate: [AdminGuard],
  },
  {
    path: ':companyName/cadastrar-produto', // também com slug
    loadComponent: () =>
      import('../admin/register-product/register-product-page/register-product-page').then(
        (m) => m.RegisterProductPage
      ),
    canActivate: [AdminGuard],
  }
];

// adminRoutes.push({

// });

