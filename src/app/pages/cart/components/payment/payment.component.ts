import { ToastrService } from 'ngx-toastr';
import { CurrencyPipe } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Inject,
  Input,
  Signal,
  signal,
} from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
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
import { PickupOptionComponent } from '../pickup-option/pickup-option.component';
import { DeliveryFeeService } from '../../services/delivery-fee.service';
import { CompanyService } from '@shared/services/company/company.service';
import { DeliveryAddress } from '../../interfaces/address';
import { Company } from '@shared/interfaces/company/company';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { OnlyNumbersDirective } from 'src/app/widget/directives/only-numbers.directive';

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
  private toastrService = inject(ToastrService);

  public companyId = this.localStorageService.getSignal('companyId', '0');
  public loadingService = inject(LoadingService);
  public changeFor = signal<number | null>(null);
  public selectedPayment = signal<string>('cartao');
  public total!: number;
  public company = signal<Company>({} as Company);
  public loadingAddress = signal(false);

  constructor() {
    effect(() => {
      const client = this.selectedAddress();
      if (!client?.street || !this.company) return;

      const clientAddress = `${client.street}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}, ${client.cep}`;
      const company = this.company();
      const companyAddress = `${company.street}, ${company.number} - ${company.neighborhood}, ${company.city} - ${company.state}, ${company.cep}`;

      this.loadingAddress.set(true);

      this.deliveryFeeService
        .getDeliveryFee(companyAddress, clientAddress)
        .subscribe({
          next: (fee) => {
            this.total =
              this.carts.reduce((accum, item) => accum + item.totalPrice, 0) +
              (this.selectedDelivery() ? fee : 0);
          },
          error: () => {
            this.toastrService.error('Erro ao calcular taxa de entrega');
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
      'companies',
      this.companyId()
    );

    if (company) {
      this.company.set(company);
    }
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

    console.log(this.changeFor());
    // await this.stripeService.createOrderCheckoutSession(
    //   productName,
    //   amountInCents,
    //   metadata
    // );
  }
}
