import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-food-details',
  imports: [],
  templateUrl: './food-details.component.html',
  styleUrl: './food-details.component.scss',
})
export class FoodDetailsComponent {
  @Input() food!: any;
  @Input() additionalItems!: any;

  public selectedAdditions: { [key: string]: number } = {};

  public increaseAddition(item: { name: string; price: number }): void {
    if (!this.selectedAdditions[item.name]) {
      this.selectedAdditions[item.name] = 1;
    } else {
      this.selectedAdditions[item.name]++;
    }
  }

  public decreaseAddition(item: { name: string; price: number }): void {
    if (this.selectedAdditions[item.name] && this.selectedAdditions[item.name] > 0) {
      this.selectedAdditions[item.name]--;
    }
  }
}
