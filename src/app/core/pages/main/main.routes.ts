import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/authGuard';
import { PaymentSuccessGuard } from '../../guards/paymentRedirectGuard';
import { PaymentStatusResolver } from 'src/app/widget/payment-status-resolver';

export const mainRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../../pages/home/home-page/home.page').then((m) => m.HomePage),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('../../../pages/perfil/perfil-page/perfil.page').then(
        (m) => m.PerfilPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'categorias',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../../../pages/categories/categories-page/categories.page'
          ).then((m) => m.CategoriesPage),
      },
      {
        path: 'comida/:id',
        loadComponent: () =>
          import('../../../pages/food/food-page/food.page').then(
            (m) => m.FoodPage
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
          import('../../../pages/food/food-page/food.page').then(
            (m) => m.FoodPage
          ),
      },
      {
        path: 'comida/:id',
        loadComponent: () =>
          import(
            '../../../pages/food-view/food-view-page/food-view.page.'
          ).then((m) => m.FoodViewPage),
      },
      {
        path: 'comida/:id/:itemId',
        loadComponent: () =>
          import(
            '../../../pages/food-view/food-view-page/food-view.page.'
          ).then((m) => m.FoodViewPage),
      },
    ],
  },

  {
    path: 'cart',
    loadComponent: () =>
      import('../../../pages/cart/cart-page/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('../../../pages/orders/order-page/order.page').then(
        (m) => m.OrderPage
      ),
  },
  {
    path: 'sucesso-pagamento',
    loadComponent: () =>
      import('../successful-payment/successful-payment.page').then(
        (m) => m.SuccessfulPaymentPage
      ),
    // resolve: { payment: PaymentStatusResolver },
    // canActivate: [PaymentSuccessGuard],
  },
  {
    path: 'falha-pagamento',
    loadComponent: () =>
      import('../fail-payment/fail-payment.page').then(
        (m) => m.FailPaymentPage
      ),
  },
];
