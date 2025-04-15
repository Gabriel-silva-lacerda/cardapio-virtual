import { CurrencyPipe } from '@angular/common';
import { Component, inject, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '@shared/services/order/order.service';
import { AuthService } from '../../../../domain/auth/services/auth.service';
import {
  createPreferenceItems,
  transformCartItemsToOrderItems,
} from '@shared/utils/oder.utils';
import { StripeService } from '@shared/services/stripe/stripe.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';

enum PaymentMethod {
  Entrega = 'entrega',
  CreditCard = 'creditCard',
  Pix = 'pix',
}

@Component({
  selector: 'app-payment',
  imports: [CurrencyPipe, FormsModule, MatTooltipModule, LoadingComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  @Input() carts!: iCartItem[];
  @Input() selectedDelivery = true;
  @Input() deliveryAddressId!: string;
  private stripeService = inject(StripeService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  public loadingService = inject(LoadingService);

  public selectedPayment: PaymentMethod | null = null;
  public total!: number;

  ngOnInit() {
    this.total = this.carts.reduce(
      (accum: any, item: any) => accum + item.totalPrice,
      0
    );
  }

  backToPaymentAddress() {
    this.orderService.showPayment.set(false);
  }

  onConfirm(): void {
    this.processPayment(this.carts);
  }

  async processPayment(carts: iCartItem[]): Promise<void> {
    const userId = this.authService.currentUser()?.id;
    const companyId = carts[0].food.company_id;

    const order = {
      user_id: userId,
      items: transformCartItemsToOrderItems(carts),
    };

    const orderItems = order.items.map((item, index) => ({
      FoodId: item.food_id,
      Quantity: item.quantity,
      Observations: item.observations || '',
    }));

    const orderItemExtras = order.items.flatMap((item, index) =>
      item.extras.map((extra) => ({
        ExtraId: extra.extra_id,
        ExtraQuantity: extra.extra_quantity,
      }))
    );

    const metadata = {
      UserId: userId,
      CompanyId: companyId,
      OrderItems: orderItems,
      OrderItemExtras: orderItemExtras,
      DeliveryAddressId: this.deliveryAddressId,
      Delivery: this.selectedDelivery,
    };

    console.log(order.items);

    const productName = carts.map((item) => item.food.name).join(' + ');
    const amountInCents = this.total * 100;

    await this.stripeService.createOrderCheckoutSession(
      productName,
      amountInCents,
      metadata
    );
  }
}
