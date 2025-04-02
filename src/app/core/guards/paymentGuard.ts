import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PaymentGuard implements CanActivate {
  private router = inject(Router);

  canActivate(): boolean {
    const paymentPending = localStorage.getItem('payment_pending');

    if (paymentPending === 'true') {
      localStorage.removeItem('payment_pending');
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
