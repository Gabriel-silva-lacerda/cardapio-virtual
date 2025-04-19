import { Component, inject, OnInit } from '@angular/core';
import { PaymentComponent } from '@shared/components/payment/payment.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { OrderService } from '@shared/services/order/order.service';
import { PaymentToken } from '@shared/interfaces/order/payment-token';
import { ePurpose } from '@shared/enums/purpose.enum';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-successful-payment',
  imports: [PaymentComponent],
  templateUrl: './successful-payment.page.html',
  styleUrl: './successful-payment.page.scss',
})
export class SuccessfulPaymentPage implements OnInit {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;

    if (userId) {
      const cartKey = `cart-${userId}`;
      this.localStorageService.removeItem(cartKey);

      this.checkPaymentToken(userId);
    }
  }

  private async checkPaymentToken(userId: string) {
    try {
      const tokens = await this.orderService.getAllByField<PaymentToken>(
        'payment_tokens',
        'user_id',
        userId
      );

      const now = new Date();

      const validToken = tokens.find(
        (token) =>
          token.purpose === ePurpose.Order &&
          token.used === false &&
          new Date(token.expires_at) > now
      );

      if (!validToken) {
        this.router.navigateByUrl('/');
        return;
      }

      await this.orderService.update<PaymentToken>(
        'payment_tokens',
        validToken.id,
        {
          used: true,
        }
      );
    } catch (err) {
      this.router.navigateByUrl('/');
    }
  }
}
