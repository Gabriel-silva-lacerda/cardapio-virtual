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
  @Input() foods: any[] = [];
  @Input() loading = false;
  @Input() isSubcategory = false;
  @Input() itemCount = 0;
  @Input() expanded = false;

  @Output() novoProduto = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() openFoodDialog = new EventEmitter<any>();
  @Output() editFood = new EventEmitter<any>();
  @Output() removeFood = new EventEmitter<any>();
}
