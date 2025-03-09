import { PaymentComponent } from "@shared/components/payment/payment.component";
import { BasePaymentPage } from "../../base/base-payment/base-payment.page";
import { Component } from "@angular/core";


@Component({
  selector: 'app-fail-payment',
  imports: [PaymentComponent],
  templateUrl: './fail-payment.page.html',
  styleUrl: './fail-payment.page.scss',
})
export class FailPaymentPage extends BasePaymentPage {
  async updateOrderStatus(): Promise<void> {
    this.localStorageService.setItem(
      `order_${this.externalReference}_updated`,
      false
    );
  }
}
