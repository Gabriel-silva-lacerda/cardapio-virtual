import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { Company } from '@shared/interfaces/company/company';
import { CompanyService } from '@shared/services/company/company.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-add-fee-dialog',
  imports: [
    GenericDialogComponent,
    FormsModule,
    NgxMaskDirective,
    CurrencyPipe,
    LoadingScreenComponent,
  ],
  templateUrl: './add-fee-dialog.component.html',
  styleUrl: './add-fee-dialog.component.scss',
})
export class AddFeeDialogComponent {
  private dialogRef = inject(MatDialogRef<AddFeeDialogComponent>);
  private distanceKm = signal<number>(0);
  private showFee = signal<boolean>(false);
  private companyService = inject(CompanyService);

  public company = inject<Company>(MAT_DIALOG_DATA);
  private originalFeePerKm = this.company.delivery_fee_per_km;

  public distanceInput: string | number = '';
  public loading = signal(false);

  ngOnInit() {
    const fee = this.company.delivery_fee_per_km;

    if (typeof fee === 'number') {
      this.company.delivery_fee_per_km = fee.toFixed(2).replace('.', ',');
    }
  }

  public deliveryFee = computed(() => {
    if (!this.distanceKm() || !this.company?.delivery_fee_per_km) return 0;
    const feePerKm = +this.company.delivery_fee_per_km
      .toString()
      .replace(',', '.');
    return Math.round(this.distanceKm() * feePerKm * 100) / 100;
  });

  simulateFee() {
    const normalized = this.distanceInput.toString().replace(',', '.');
    const value = +normalized;
    if (!isNaN(value)) {
      this.distanceKm.set(value);
      this.showFee.set(true);
    } else {
      this.showFee.set(false);
    }
  }

  async onDeliveryFeeBlur() {
    const newFee = +this.company.delivery_fee_per_km
      .toString()
      .replace(',', '.');

    const original = +this.originalFeePerKm.toString().replace(',', '.');

    if (newFee === original) {
      return;
    }

    try {
      this.loading.set(true);

      await this.companyService.update('companies', this.company.id as string, {
        delivery_fee_per_km: newFee,
      });
    } finally {
      this.loading.set(false);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
