import { NgClass } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { Address } from '../../interfaces/address';
import { CardAddressComponent } from '../card-address/card-address.component';

@Component({
  selector: 'app-save-address-dialog',
  imports: [FormsModule, NgClass, CardAddressComponent],
  templateUrl: './save-address-dialog.component.html',
  styleUrl: './save-address-dialog.component.scss',
})
export class SaveAddressDialogComponent {
  private localStorageService = inject(LocalStorageService);
  public selectedAddress = signal<Address | null>(null);

  constructor(
    public dialogRef: MatDialogRef<SaveAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const storedAddress =
      this.localStorageService.getItem<Address>('selectedAddress');

    if (storedAddress) {
      this.selectedAddress.set(storedAddress);
    } else if (this.data && this.data.length > 0) {
      this.selectedAddress.set(this.data[0]);
    }
  }

  selectAddress(address: Address) {
    this.selectedAddress.set(address);
    this.localStorageService.setItem<Address>('selectedAddress', address);
    this.dialogRef.close(address);
  }
}
