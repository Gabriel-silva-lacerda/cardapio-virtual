import { CurrencyPipe } from '@angular/common';
import { Component, inject, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '@shared/services/order/order.service';
import { AuthService } from '../../../../domain/auth/services/auth.service';
import { createPreferenceItems, transformCartItemsToOrderItems } from '@shared/utils/oder.utils';

enum PaymentMethod {
  Entrega = 'entrega',
  CreditCard = 'creditCard',
  Pix = 'pix'
}

@Component({
  selector: 'app-payment',
  imports: [CurrencyPipe, FormsModule, MatTooltipModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  @Input() carts!: iCartItem[];
  @Input() orderAddress!: any;
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  public selectedPayment: PaymentMethod | null = null;
  public total!: number;

  ngOnInit() {
    this.total = this.carts.reduce((accum: any, item: any) => accum + item.totalPrice, 0);
  }

  backToPaymentAddress() {
    this.orderService.showPayment.set(false);
  }

  onConfirm(): void {
    this.processPayment(this.carts);
  }

  async processPayment(carts: iCartItem[]): Promise<void> {
    const order = {
      user_id: this.authService.currentUser()?.id,
      items: transformCartItemsToOrderItems(carts),
    };

    // const { orderId } = await this.orderService.createOrder(order, this.orderAddress);
    // const preferenceItems = createPreferenceItems(carts, orderId);
    this.backToPaymentAddress();
    // const body = {
    //   items: preferenceItems,
    //   externalReference: orderId.toString(),
    //   backUrls: {
    //     success: 'http://localhost:4200/sucesso-pagamento',
    //     pending: 'http://localhost:4200/pendente-pagamento',
    //     failure: 'http://localhost:4200/falha-pagamento',
    //   },
    // };

    // this.paymentService.post<{ initPoint: string }>(body, 'Payment/create-preference')
    //   .subscribe({
    //     next: (response: { initPoint: string }) => {
    //       window.location.href = response.initPoint;
    //     },
    //   });
  }
}
