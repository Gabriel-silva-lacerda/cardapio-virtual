import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FoodListComponent } from '../food-list/food-list.component';
import { NgClass } from '@angular/common';

interface FoodContainerData {
  foods: any[];
  loading: boolean;
  isSubcategory: boolean;
  itemCount: number;
  expanded: boolean;
}

interface FoodContainerCallbacks {
  novoProduto: () => void;
  searchChange: (term: string) => void;
  openFoodDialog: (food: any) => void;
  editFood: (food: any) => void;
  removeFood: (food: any) => void;
}

@Component({
  selector: 'app-food-card',
  imports: [FoodListComponent, NgClass],
  templateUrl: './food-card.component.html',
  styleUrl: './food-card.component.scss'
})
export class FoodCardComponent {
  @Input() data!: FoodContainerData;
  @Input() callbacks!: FoodContainerCallbacks;

  onNovoProduto() {
    this.callbacks.novoProduto();
  }

  onSearchChange(term: any) {
    this.callbacks.searchChange(term);
  }

  onOpenFoodDialog(food: any) {
    this.callbacks.openFoodDialog(food);
  }

  onEditFood(food: any) {
    this.callbacks.editFood(food);
  }

  onRemoveFood(food: any) {
    this.callbacks.removeFood(food);
  }
}
