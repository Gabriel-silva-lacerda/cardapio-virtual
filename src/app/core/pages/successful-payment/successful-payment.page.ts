import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { interval, Subscription, takeWhile } from 'rxjs';
import { OrderService } from '@shared/services/order/order.service';
import { mapPaymentStatus } from '@shared/utils/mapPaymentStatus.utils';

@Component({
  selector: 'app-successful-payment',
  imports: [],
  templateUrl: './successful-payment.page.html',
  styleUrl: './successful-payment.page.scss',
})
export class SuccessfulPaymentPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private localStorageService = inject(LocalStorageService);
  private countdownSubscription: Subscription | null = null;
  private collectionStatus: string | null = null;
  private externalReference: string | null = null;

  public countdown: number = 3;
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

      const newStatus = mapPaymentStatus(this.collectionStatus);

      await this.orderService.updatePaymentStatus(
        +this.externalReference,
        newStatus
      );

      this.localStorageService.setItem(
        `order_${this.externalReference}_updated`,
        true
      );

      this.startCountdown();
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
