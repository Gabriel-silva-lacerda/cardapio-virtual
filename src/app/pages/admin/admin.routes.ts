import { Routes } from '@angular/router';
import { AdminGuard } from 'src/app/core/guards/adminGuard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../admin/home/home-page/home.page').then(
        (m) => m.HomePage
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'cadastrar-produto',
    loadComponent: () =>
      import('../admin/register-product/register-product-page/register-product-page').then(
        (m) => m.RegisterProductPage
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'cadastrar-categoria',
    loadComponent: () =>
      import('../admin/register-category/register-category-page/register-category.page').then(
        (m) => m.RegisterCategoryPage
      ),
    canActivate: [AdminGuard],
  }
];

