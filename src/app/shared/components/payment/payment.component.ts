import { NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-payment',
  imports: [NgClass],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  @Input() error = false;
  @Input({ required: true }) paymentText!: string;
  @Input({ required: true }) backText!: string;
  @Input({ required: true }) link!: string;
  @Input() hasQueryParam = false;
  @Input() queryParams!: NavigationExtras;

  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  redirectToHome() {
    this.router.navigate([this.link], this.hasQueryParam ? { queryParams: this.queryParams } : {});
  }
}
