import { Routes } from '@angular/router';
import { isLoggedGuard } from '../../guards/isLoggedGuard';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans.page').then((m) => m.PlansPage),
    canActivate: [isLoggedGuard]
  },
  {
    path: 'pagamento/:id',
    loadComponent: () => import('./subscription/subscription.page').then((m) => m.SubscriptionPage),
    canActivate: [isLoggedGuard]
  }
];
