import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { OrderService } from '@shared/services/order/order.service';
import { mapPaymentStatus } from '@shared/utils/mapPaymentStatus.util';
import { interval, Subscription, takeWhile } from 'rxjs';

@Component({
  selector: 'app-base-payment',
  imports: [],
  templateUrl: './base-payment.page.html',
  styleUrl: './base-payment.page.scss'
})
export abstract class BasePaymentPage {
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected orderService = inject(OrderService);
  protected localStorageService = inject(LocalStorageService);
  protected collectionStatus: string | null = null;
  protected externalReference: string | null = null;
  private countdownSubscription: Subscription | null = null;

  public countdown: number = 10;
  public error: boolean = false;

  ngOnInit() {
    this.getQueryParams();
  }

  getQueryParams() {
    this.route.queryParams.subscribe((params) => {
      this.collectionStatus = params['collection_status'];
      this.externalReference = params['external_reference'];

      if (this.externalReference && this.collectionStatus) {
        this.updateOrder();
      } else {
        this.error = true;
      }
    });
  }

  abstract updateOrderStatus(): Promise<void>;

  async updateOrder() {
    if (!this.externalReference || !this.collectionStatus) {
      this.error = true;
      return;
    }

    try {
      const alreadyUpdated = this.localStorageService.getItem<boolean>(
        `order_${this.externalReference}_updated`
      );

      if (alreadyUpdated) {
        return;
      }

      await this.updateOrderStatus();

      // this.localStorageService.setItem(
      //   `order_${this.externalReference}_updated`,
      //   true
      // );
      const newStatus = mapPaymentStatus(this.collectionStatus);

        await this.orderService.updatePaymentStatus(
        +this.externalReference,
        newStatus
      );

      // this.startCountdown();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      this.error = true;
    }
  }

  startCountdown() {
    this.countdownSubscription = interval(1000)
      .pipe(takeWhile(() => this.countdown > 0))
      .subscribe(() => {
        this.countdown--;

        if (this.countdown === 0) {
          this.redirectToHome();
        }
      });
  }

  redirectToHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
}
