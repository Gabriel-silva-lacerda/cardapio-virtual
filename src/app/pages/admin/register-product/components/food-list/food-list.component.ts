import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';

@Component({
  selector: 'app-food-list',
  imports: [IconButtonComponent, SearchInputComponent, LoadingComponent],
  templateUrl: './food-list.component.html',
  styleUrl: './food-list.component.scss'
})
export class FoodListComponent {
  @Input() foods: any[] = [];
  @Input() loading = false;
  @Input() isSubcategory = false;

  @Output() onSearchChange = new EventEmitter<string>();
  @Output() openFoodDialog = new EventEmitter<any>();
  @Output() editFood = new EventEmitter<any>();
  @Output() removeFood = new EventEmitter<any>();
}
