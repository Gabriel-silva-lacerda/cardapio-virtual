import { Component } from '@angular/core';

@Component({
  selector: 'app-peding-payment',
  imports: [],
  templateUrl: './peding-payment.page.html',
  styleUrl: './peding-payment.page.scss'
})
export class PedingPaymentPage {
  private collectionStatus: string | null = null;
  private externalReference: string | null = null;
}
