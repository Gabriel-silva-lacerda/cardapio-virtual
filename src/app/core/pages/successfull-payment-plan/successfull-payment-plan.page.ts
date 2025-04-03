import { Component, } from '@angular/core';
import { PaymentComponent } from '@shared/components/payment/payment.component';

@Component({
  selector: 'app-successfull-payment-plan',
  imports: [PaymentComponent],
  templateUrl: './successfull-payment-plan.page.html',
  styleUrl: './successfull-payment-plan.page.scss',
})
export class SuccessfullPaymentPlanPage {
} 
