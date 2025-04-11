import { Component, inject, Input } from '@angular/core';
import { iFood } from '@shared/interfaces/food/food.interface';
import { iExtra } from '../../../../core/shared/interfaces/extra/extra.interface';
import { FormsModule } from '@angular/forms';
import { FoodService } from '@shared/services/food/food.service';
import { BackButtonComponent } from '../../../../core/shared/components/back-button/back-button.component';

@Component({
  selector: 'app-food-details',
  imports: [FormsModule, BackButtonComponent],
  templateUrl: './food-details.component.html',
  styleUrl: './food-details.component.scss',
})
export class FoodDetailsComponent {
  @Input() food!: iFood | null;
  @Input() extras: iExtra[] = [];

  private foodService = inject(FoodService);
  public selectedAdditions = this.foodService.selectedAdditions;
  public observations = this.foodService.observations;

  // Função para aumentar a quantidade de adicionais
  public increaseAddition(item: {
    id: string;
    name: string;
    price: number;
  }): void {
    this.selectedAdditions.update((state: { [key: string]: iExtra }) => {
      const currentItem = state[item.id] || {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 0,
      };

      return {
        ...state,
        [item.id]: { ...currentItem, quantity: currentItem.quantity + 1 },
      };
    });

    this.updateTotalAdditions();
  }

  public decreaseAddition(item: {
    id: string;
    name: string;
    price: number;
  }): void {
    const selected: { [key: string]: iExtra } = this.selectedAdditions();
    const currentItem = selected[item.id];


    if (currentItem && currentItem.quantity > 0) {
      this.selectedAdditions.update((state) => ({
        ...state,
        [item.id]: { ...currentItem, quantity: currentItem.quantity - 1 },
      }));
    }

    this.updateTotalAdditions();
  }

  private updateTotalAdditions(): void {
    const selected = this.selectedAdditions();
    let totalAdditions = Object.values(selected).reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    this.foodService.totalAddition.set(totalAdditions);
  }

  get selectedAdditionsMap(): { [key: string]: iExtra } {
    return this.selectedAdditions();
  }

}
