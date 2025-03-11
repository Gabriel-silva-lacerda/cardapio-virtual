import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  @Input() error = false;
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  redirectToHome() {
    this.router.navigate(['/app'], { queryParams: { empresa: this.companyName() } });
  }
}
