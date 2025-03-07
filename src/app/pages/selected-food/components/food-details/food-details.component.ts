import { Component, inject, Input } from '@angular/core';
import { iFood } from '@shared/interfaces/food.interface';
import { iExtra } from '../../interfaces/extra.interface';
import { FormsModule } from '@angular/forms';
import { FoodService } from '@shared/services/food/food.service';
import { BackButtonComponent } from "../../../../core/shared/components/back-button/back-button.component";

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
  public increaseAddition(item: { id: number; name: string; price: number }): void {
    this.selectedAdditions.update(state => {
      // Verificar se o item já está no estado, caso contrário, inicializá-lo com quantidade 0
      const currentItem = state[item.id] || { id: item.id, name: item.name, price: item.price, quantity: 0 };
      // Retornar um novo estado com o spread correto
      return {
        ...state,
        [item.id]: { ...currentItem, quantity: currentItem.quantity + 1 }
      };
    });
    this.updateTotalAdditions();
  }

  // Função para diminuir a quantidade de adicionais
  public decreaseAddition(item: { id: number; name: string; price: number }): void {
    if (this.selectedAdditions()[item.id] && this.selectedAdditions()[item.id].quantity > 0) {
      this.selectedAdditions.update(state => {
        const currentItem = state[item.id];
        // Retornar um novo estado com o spread correto
        return {
          ...state,
          [item.id]: { ...currentItem, quantity: currentItem.quantity - 1 }
        };
      });
    }
    this.updateTotalAdditions();
  }

  private updateTotalAdditions(): void {
    let totalAdditions = Object.values(this.selectedAdditions()).reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    this.foodService.totalAddition.set(totalAdditions);
  }

}
