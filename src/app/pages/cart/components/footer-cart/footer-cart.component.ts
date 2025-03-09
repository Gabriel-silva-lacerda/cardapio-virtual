import { CurrencyPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../../../core/shared/services/order/order.service';
import { createPreferenceItems, transformCartItemsToOrderItems } from '@shared/utils/oder.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../payment/payment.component';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaymentAddressDialogComponent } from '../payment-address-dialog/payment-address-dialog.component';

@Component({
  selector: 'app-footer-cart',
  imports: [CurrencyPipe, LoadingComponent],
  templateUrl: './footer-cart.component.html',
  styleUrl: './footer-cart.component.scss',
})
export class FooterCartComponent implements OnInit {
  @Input() carts!: iCartItem[];
  private dialog = inject(MatDialog);
  public loadingService = inject(LoadingService);

  public total!: number;

  ngOnInit(): void {
    this.total = this.carts.reduce((accum, item) => accum + item.totalPrice, 0);
    this.openAddressDialog();
  }

  openAddressDialog() {
    const dialogRef = this.dialog.open(PaymentAddressDialogComponent, {
      width: '400px',
      data: this.carts
    });

    dialogRef.afterClosed().subscribe(async (selectedPayment) => {
      if (selectedPayment) {
        dialogRef.close();
      }
    });
  }

}
