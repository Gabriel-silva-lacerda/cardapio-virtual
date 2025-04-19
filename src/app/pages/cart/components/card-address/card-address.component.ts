import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { DeliveryAddress } from '../../interfaces/address';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card-address',
  imports: [FormsModule, NgClass],
  templateUrl: './card-address.component.html',
  styleUrl: './card-address.component.scss',
})
export class CardAddressComponent {
  @Input() address!: DeliveryAddress;
  @Input() selectedAddress = signal<DeliveryAddress | null>(null);
  @Input() isSelectAddress = false;
  @Output() select = new EventEmitter<DeliveryAddress>();

  onClick() {
    this.select.emit(this.address);
  }
}
