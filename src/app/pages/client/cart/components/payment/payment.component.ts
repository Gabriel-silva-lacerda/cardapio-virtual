import { CurrencyPipe } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { OrderService } from '@shared/services/order/order.service';

import { transformCartItemsToOrderItems } from '@shared/utils/oder.util';
import { StripeService } from '@shared/services/stripe/stripe.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PickupOptionComponent } from '../pickup-option/pickup-option.component';
import { DeliveryFeeService } from '../../services/delivery-fee.service';
import { CompanyService } from '@shared/services/company/company.service';
import { DeliveryAddress } from '../../interfaces/address';
import { Company } from '@shared/interfaces/company/company';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { OnlyNumbersDirective } from 'src/app/widget/directives/only-numbers.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'app-payment',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatTooltipModule,
    LoadingComponent,
    PickupOptionComponent,
    LoadingScreenComponent,
    FormsModule,
    OnlyNumbersDirective,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  @Input() carts!: iCartItem[];
  @Input() selectedDelivery = signal(false);
  @Input() selectedAddress = signal({} as DeliveryAddress);

  private stripeService = inject(StripeService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private deliveryFeeService = inject(DeliveryFeeService);
  private companyService = inject(CompanyService);
  private localStorageService = inject(LocalStorageService);
  private toast = inject(ToastService);

  public companyId = this.localStorageService.getSignal('companyId', '0');
  public loading = signal(false);
  public changeFor = signal<number | null>(null);
  public selectedPayment = signal<string>('cartao');
  public total!: number;
  public subTotal!: number;
  public company = signal<Company>({} as Company);
  public loadingAddress = signal(false);
  public deliveryFee = signal(0);

  constructor() {
    effect(() => {
      const client = this.selectedAddress();
      if (!client?.street || !this.company) return;

      const clientAddress = `${client.street}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}, ${client.cep}`;
      const company = this.company();
      const companyAddress = `${company.street}, ${company.number} - ${company.neighborhood}, ${company.city} - ${company.state}, ${company.cep}`;

      this.loadingAddress.set(true);

      this.deliveryFeeService
        .getDeliveryFee(
          companyAddress,
          clientAddress,
          company.delivery_fee_per_km as number
        )
        .subscribe({
          next: (fee) => {
            this.deliveryFee.set(fee);

            this.total =
              this.carts.reduce((accum, item) => accum + item.totalPrice, 0) +
              (this.selectedDelivery() ? fee : 0);
          },
          error: () => {
            this.toast.error('Erro ao calcular taxa de entrega');
            this.loadingAddress.set(false);
          },
          complete: () => {
            this.loadingAddress.set(false);
          },
        });
    });
  }

  async ngOnInit() {
    const company = await this.companyService.getById<Company>(
      this.companyId()
    );

    if (company) {
      this.company.set(company);
    }

    this.subTotal = this.carts.reduce(
      (accum, item) => accum + item.totalPrice,
      0
    );
  }

  backToPaymentAddress() {
    this.orderService.showPayment.set(false);
  }

  onConfirm(): void {
    this.processPayment(this.carts);
  }

  setSelectedPayment(method: string) {
    this.selectedPayment.set(method);
  }

  async processPayment(carts: iCartItem[]): Promise<void> {
    const userId = this.authService.currentUser()?.id;
    const companyId = carts[0].food.company_id;

    const order = {
      user_id: userId,
      items: transformCartItemsToOrderItems(carts),
    };

    const orderItems = order.items.map((item) => ({
      FoodId: item.food_id,
      Quantity: item.quantity,
      Observations: item.observations || '',
    }));

    const orderItemExtras = order.items.flatMap((item) =>
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
      DeliveryAddressId: this.selectedAddress().id,
      Delivery: this.selectedDelivery(),
      ChangeFor:
        this.selectedPayment() === 'dinheiro' ? this.changeFor() : null,
    };

    const productName = carts.map((item) => item.food.name).join(' + ');
    const amountInCents = this.total * 100;

    await this.stripeService.createOrderCheckoutSession(
      productName,
      amountInCents,
      metadata
    );
  }
}
