import { CurrencyPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../../../core/shared/services/order/order.service';
import { createPreferenceItems, transformCartItemsToOrderItems } from '@shared/utils/oder.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-footer-cart',
  imports: [CurrencyPipe],
  templateUrl: './footer-cart.component.html',
  styleUrl: './footer-cart.component.scss',
})
export class FooterCartComponent implements OnInit {
  @Input() carts!: iCartItem[];
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  public total!: number;

  ngOnInit(): void {
    this.total = this.carts.reduce((accum, item) => accum + item.totalPrice, 0);
  }

  async finalizar() {
    const order = {
      user_id: this.authService.currentUser()?.id,
      items: transformCartItemsToOrderItems(this.carts),
    };

    const { orderId } = await this.orderService.createOrder(order);
    const preferenceItems  = createPreferenceItems(this.carts, orderId);

    console.log('Footer Cart', preferenceItems);

    this.paymentService
      .createPreference(preferenceItems, orderId.toString())
      .subscribe({
        next: (response: { initPoint: string}) => {
          window.location.href = response.initPoint ;
        },
        error: (err) => {
          console.error('Erro ao criar preferência de pagamento:', err);
          alert('Ocorreu um erro ao processar o pagamento. Tente novamente.');
        },
      });
  }
}
