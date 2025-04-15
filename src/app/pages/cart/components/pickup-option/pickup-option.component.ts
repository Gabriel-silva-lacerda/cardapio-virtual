import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-pickup-option',
  imports: [MatTooltipModule],
  templateUrl: './pickup-option.component.html',
  styleUrl: './pickup-option.component.scss',
})
export class PickupOptionComponent {
  @Input() selectedDelivery: boolean = false; // estado atual
  @Input() value: boolean = false; // valor que representa esta opção
  @Input() text: string = ''; // "Retirar" ou "Entregar"
  @Input() matTooltip: string = '';

  @Output() selectedDeliveryChange = new EventEmitter<boolean>();

  select() {
    this.selectedDeliveryChange.emit(this.value);
  }

  isSelected(): boolean {
    return this.selectedDelivery === this.value;
  }
}
