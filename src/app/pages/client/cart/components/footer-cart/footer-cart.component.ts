import { CurrencyPipe } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentAddressDialogComponent } from '../payment-address-dialog/payment-address-dialog.component';
import { Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-footer-cart',
  imports: [CurrencyPipe],
  templateUrl: './footer-cart.component.html',
  styleUrl: './footer-cart.component.scss',
})
export class FooterCartComponent implements OnInit {
  @Input() carts!: iCartItem[];
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);
  public companyService = inject(CompanyService);
  public loading = signal(false);
  public total!: number;

  ngOnInit(): void {
    this.total = this.carts.reduce((accum, item) => accum + item.totalPrice, 0);
  }

  openAddressDialog() {
    if (this.authService.isLogged()) {
      const dialogRef = this.dialog.open(PaymentAddressDialogComponent, {
        width: '400px',
        maxHeight: '800px',
        data: this.carts,
      });

      dialogRef.afterClosed().subscribe(async (selectedPayment) => {
        if (selectedPayment) {
          dialogRef.close();
        }
      });
    } else {
      this.router.navigate(['/auth', this.companyService.companyName()]);
    }
  }
}
