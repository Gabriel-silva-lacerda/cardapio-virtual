import { Routes } from '@angular/router';
import { PaymentGuard } from '../../guards/paymentGuard';
import { IsLoggedGuard } from '../../guards/isLoggedGuard';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans.page').then((m) => m.PlansPage),
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'pagamento/:id',
    loadComponent: () =>
      import('./subscription/subscription.page').then(
        (m) => m.SubscriptionPage
      ),
      canActivate: [IsLoggedGuard]
  },
  {
    path: 'detalhes/:id',
    loadComponent: () =>
      import('./plan-details/plan-details.page').then((m) => m.PlanDetailsPage),
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'sucesso-pagamento',
    loadComponent: () =>
      import('../successfull-payment-plan/successfull-payment-plan.page').then(
        (m) => m.SuccessfullPaymentPlanPage
      ),
    canActivate: [PaymentGuard],
  },
];
