import { LocalStorageService } from './../../shared/services/localstorage/localstorage.service';
import { Component, inject, OnInit } from '@angular/core';
import { PaymentComponent } from '@shared/components/payment/payment.component';
import { BasePaymentPage } from '../../base/base-payment/base-payment.page';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-successful-payment',
  imports: [PaymentComponent],
  templateUrl: './successful-payment.page.html',
  styleUrl: './successful-payment.page.scss',
})
export class SuccessfulPaymentPage implements OnInit {
  private route = inject(ActivatedRoute);
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);
  public status = '';

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;

    if (userId) {
      const cartKey = `cart-${userId}`;
      this.localStorageService.removeItem(cartKey);
    }

    this.route.queryParams.subscribe((params) => {
      this.status = params['status'];

      if (this.status === 'success') {
        sessionStorage.setItem('paymentRedirect', 'success');
      }
    });
  }
}
