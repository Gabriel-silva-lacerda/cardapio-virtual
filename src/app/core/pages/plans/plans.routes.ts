import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans.page').then((m) => m.PlansPage),
  },
  {
    path: 'pagamento/:id',
    loadComponent: () => import('./subscription/subscription.page').then((m) => m.SubscriptionPage),
  }
];
