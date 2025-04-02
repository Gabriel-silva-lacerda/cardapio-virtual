import { Routes } from '@angular/router';
import { isLoggedGuard } from '../../guards/isLoggedGuard';
import { PaymentGuard } from '../../guards/paymentGuard';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans.page').then((m) => m.PlansPage),
    // canActivate: []
  },
  {
    path: 'pagamento/:id',
    loadComponent: () => import('./subscription/subscription.page').then((m) => m.SubscriptionPage),
    // canActivate: [isLoggedGuard]
  },
  {
    path: 'sucesso-pagamento',
    loadComponent: () => import('../successfull-payment-plan/successfull-payment-plan.page').then((m) => m.SuccessfullPaymentPlanPage),
    canActivate: [PaymentGuard]
  },
];
