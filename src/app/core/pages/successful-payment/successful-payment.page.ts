import { Component} from '@angular/core';
import { PaymentComponent } from '@shared/components/payment/payment.component';
import { BasePaymentPage } from '../../base/base-payment/base-payment.page';

@Component({
  selector: 'app-successful-payment',
  imports: [PaymentComponent],
  templateUrl: './successful-payment.page.html',
  styleUrl: './successful-payment.page.scss',
})
export class SuccessfulPaymentPage extends BasePaymentPage {
  async updateOrderStatus(): Promise<void> {
    this.localStorageService.removeItem('cart');

    this.localStorageService.setItem(
      `order_${this.externalReference}_updated`,
      true
    );

    this.startCountdown();
  }
}
