import { CurrencyPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaymentAddressDialogComponent } from '../payment-address-dialog/payment-address-dialog.component';
import { Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-footer-cart',
  imports: [CurrencyPipe, LoadingComponent],
  templateUrl: './footer-cart.component.html',
  styleUrl: './footer-cart.component.scss',
})
export class FooterCartComponent implements OnInit {
  @Input() carts!: iCartItem[];
  private localStorageService = inject(LocalStorageService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  public loadingService = inject(LoadingService);

  public total!: number;

  ngOnInit(): void {
    this.total = this.carts.reduce((accum, item) => accum + item.totalPrice, 0);
    // this.openAddressDialog();
  }

  openAddressDialog() {
    if(this.authService.isLogged()) {
      const dialogRef = this.dialog.open(PaymentAddressDialogComponent, {
        width: '400px',
        data: this.carts
      });

      dialogRef.afterClosed().subscribe(async (selectedPayment) => {
        if (selectedPayment) {
          dialogRef.close();
        }
      });

    } else {
      this.router.navigate(['/auth'], { queryParams: { empresa: this.companyName() } });
    }
  }

}
