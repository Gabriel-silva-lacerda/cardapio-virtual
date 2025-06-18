import { Routes } from '@angular/router';

export const ClienteRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pages/client/home/home-page/home.page').then((m) => m.HomePage),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('../../pages/client/perfil/perfil-page/perfil.page').then(
        (m) => m.PerfilPage
      ),
  },
  {
    path: 'categorias',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../pages/client/categories/categories-page/categories.page').then(
            (m) => m.CategoriesPage
          ),
      },
      {
        path: 'comida/:id',
        loadComponent: () =>
          import('./menu/menu-page/menu.page').then(
            (m) => m.MenuPage
          ),
      },
    ],
  },
  {
    path: 'comidas',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./menu/menu-page/menu.page').then(
            (m) => m.MenuPage
          ),
      },
      {
        path: 'comida/:id',
        loadComponent: () =>
          import('../client/food-view/food-view-page/food-view.page.').then(
            (m) => m.FoodViewPage
          ),
      },
      {
        path: 'comida/:id/:itemId',
        loadComponent: () =>
          import('../../pages/client/food-view/food-view-page/food-view.page.').then(
            (m) => m.FoodViewPage
          ),
      },
    ],
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('../../pages/client/cart/cart-page/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('../../pages/client/orders/order-page/order.page').then(
        (m) => m.OrderPage
      ),
  },
  {
    path: 'sucesso-pagamento',
    loadComponent: () =>
      import('../../../app/core/pages/successful-payment/successful-payment.page').then(
        (m) => m.SuccessfulPaymentPage
      ),
  },
  {
    path: 'falha-pagamento',
    loadComponent: () =>
      import('../../../app/core/pages/fail-payment/fail-payment.page').then(
        (m) => m.FailPaymentPage
      ),
  },
];
