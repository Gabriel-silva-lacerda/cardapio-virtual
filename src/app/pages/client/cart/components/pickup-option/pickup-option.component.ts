import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-pickup-option',
  imports: [MatTooltipModule],
  templateUrl: './pickup-option.component.html',
  styleUrl: './pickup-option.component.scss',
})
export class PickupOptionComponent {
  @Input() selectedDelivery: any = '';
  @Input() value: any = '';
  @Input() text: string = '';
  @Input() matTooltip: string = '';

  @Output() selectedDeliveryChange = new EventEmitter<any>();

  select() {
    this.selectedDeliveryChange.emit(this.value);
  }

  isSelected(): boolean {
    return this.selectedDelivery === this.value;
  }
}
