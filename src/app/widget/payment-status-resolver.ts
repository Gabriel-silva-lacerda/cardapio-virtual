import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PaymentStatusResolver implements Resolve<void> {
  resolve(route: ActivatedRouteSnapshot): void {
    const status = route.queryParams['status'];

    if (status === 'success') {
      sessionStorage.setItem('paymentRedirect', 'success');
    }
  }
}
