import { Routes } from '@angular/router';
import { PaymentGuard } from '../../guards/paymentGuard';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans.page').then((m) => m.PlansPage),
  },
  {
    path: 'pagamento/:id',
    loadComponent: () =>
      import('./subscription/subscription.page').then(
        (m) => m.SubscriptionPage
      ),
  },
  {
    path: 'detalhes/:id',
    loadComponent: () =>
      import('./plan-details/plan-details.page').then((m) => m.PlanDetailsPage),
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
