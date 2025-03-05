import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-food-details',
  imports: [],
  templateUrl: './food-details.component.html',
  styleUrl: './food-details.component.scss',
})
export class FoodDetailsComponent {
  @Input() food!: any;
  @Input() additionalItems!: any;
  @Output() additionalItemAndPriceChange = new EventEmitter<any>();  // Emite o total dos adicionais

  public selectedAdditions: { [key: string]: number } = {};

  // Função para aumentar a quantidade de adicionais
  public increaseAddition(item: { name: string; price: number }): void {
    this.selectedAdditions[item.name] = (this.selectedAdditions[item.name] || 0) + 1;
    this.updateTotalAdditions();
  }

  // Função para diminuir a quantidade de adicionais
  public decreaseAddition(item: { name: string; price: number }): void {
    if (this.selectedAdditions[item.name] && this.selectedAdditions[item.name] > 0) {
      this.selectedAdditions[item.name]--;
    }
    this.updateTotalAdditions();
  }

  // Calcular o preço total dos adicionais e emitir o evento
  private updateTotalAdditions(): void {
    let totalAdditions = Object.keys(this.selectedAdditions).reduce((sum, key) => {
      const item = this.additionalItems[this.food.type]?.find((a: any) => a.name === key);
      return sum + (this.selectedAdditions[key] * (item?.price || 0));
    }, 0);

    this.additionalItemAndPriceChange.emit({ totalAdditions, selectedAdditions: this.selectedAdditions });

  }
}
