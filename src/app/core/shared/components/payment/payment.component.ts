import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  @Input() error = false;
  private router = inject(Router);
  

  redirectToHome() {
    this.router.navigate(['/']);
  }
}
