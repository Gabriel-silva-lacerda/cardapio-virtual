import { Routes } from '@angular/router';

export const mainRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../../pages/home/home-listar/home-listar.component').then(
        (m) => m.HomeListarComponent
      ),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('../../../pages/perfil/perfil-list/perfil-list.page').then(
        (m) => m.PerfilListPage
      ),
  },
  {
    path: 'categoria/:id',
    loadComponent: () =>
      import(
        '../../../pages/selected-category/selected-category-list/selected-category-list.page'
      ).then((m) => m.SelectedCategoryListPage),
  },
  {
    path: 'food/:id',
    loadComponent: () =>
      import('../../../pages/selected-food/selected-food-list/selected-food-list.page').then(
        (m) => m.SelectdFoodListPage
      ),
  },
  {
    path: 'food/:id/:itemId',
    loadComponent: () =>
      import('../../../pages/selected-food/selected-food-list/selected-food-list.page').then(
        (m) => m.SelectdFoodListPage
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('../../../pages/cart/cart-list/cart-list.page').then(
        (m) => m.CartListPage
      ),
  },
  {
    path: 'sucesso-pagamento',
    loadComponent: () => import('../successful-payment/successful-payment.page').then((m) => m.SuccessfulPaymentPage),
  },
  {
    path: 'pedente-pagamento',
    loadComponent: () => import('../peding-payment/peding-payment.page').then((m) => m.PedingPaymentPage),
  },
  {
    path: 'falha-pagamento',
    loadComponent: () => import('../fail-payment/fail-payment.page').then((m) => m.FailPaymentPage),
  },
];
