import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food.interface';
import { iExtra } from '../../interfaces/extra.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-food-details',
  imports: [FormsModule],
  templateUrl: './food-details.component.html',
  styleUrl: './food-details.component.scss',
})
export class FoodDetailsComponent {
  @Input() food!: iFood | null;
  @Input() extras: iExtra[] = [];
  @Output() additionalItemAndPriceChange = new EventEmitter<any>();
  @Output() observationsChange = new EventEmitter<string>(); // Emitir as observações

  public selectedAdditions = signal<{ [key: number]: { id: number; name: string; price: number; quantity: number } }>({});
  public observations = signal<string>('')

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

  updateObservations() {
    this.observationsChange.emit(this.observations()); // Emite as observações para o componente pai
  }

  private updateTotalAdditions(): void {
    let totalAdditions = Object.values(this.selectedAdditions()).reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    this.additionalItemAndPriceChange.emit({ totalAdditions, selectedAdditions: this.selectedAdditions(), observations: this.observations() });
  }

}
