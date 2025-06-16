import { Component, inject, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CardAddressComponent } from '../card-address/card-address.component';
import { DeliveryAddress } from '../../interfaces/address';
import { OrderService } from '@shared/services/order/order.service';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';

@Component({
  selector: 'app-save-address-dialog',
  imports: [
    FormsModule,
    CardAddressComponent,
    LoadingScreenComponent,
    GenericDialogComponent,
  ],
  templateUrl: './save-address-dialog.component.html',
  styleUrl: './save-address-dialog.component.scss',
})
export class SaveAddressDialogComponent {
  private orderService = inject(OrderService);
  public loadingSaveAddress = signal(false);
  public selectedAddress = signal<DeliveryAddress | null>(null);

  constructor(
    public dialogRef: MatDialogRef<SaveAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    const defaultAddress = await this.orderService.getByField<DeliveryAddress>(
      'delivery_addresses',
      'is_default',
      true
    );

    if (defaultAddress) {
      this.selectedAddress.set(defaultAddress);
    }
  }

  async selectAddress(address: DeliveryAddress) {
    const current = this.selectedAddress();

    // Se o endereço clicado já é o selecionado e está como padrão, não faz nada
    if (current?.id === address.id && current?.is_default) {
      this.dialogRef.close(address);
      return;
    }

    this.loadingSaveAddress.set(true); // <- Mostra o loading

    try {
      this.selectedAddress.set(address);

      const allAddresses =
        await this.orderService.getAllByField<DeliveryAddress>(
          'delivery_addresses',
          'user_id',
          address.user_id
        );

      const updatePromises = allAddresses
        .filter((a) => a.id !== address.id && a.is_default)
        .map((a) =>
          this.orderService.update<DeliveryAddress>(
            'delivery_addresses',
            a.id,
            {
              is_default: false,
            }
          )
        );

      await Promise.all(updatePromises);

      await this.orderService.update<DeliveryAddress>(
        'delivery_addresses',
        address.id,
        { is_default: true }
      );

      this.dialogRef.close(address);
    } catch (error) {
      this.orderService.toastr.error('Erro ao definir endereço como padrão');
      this.loadingSaveAddress.set(false);
    } finally {
      this.loadingSaveAddress.set(false);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
