import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryComponent } from '../components/category/category.component';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.util';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { FoodService } from '../../../core/shared/services/food/food.service';
import { CategoryService } from '../services/category.service';
import { iCategory } from '../interfaces/category.interface';
import { iFood } from '@shared/interfaces/food.interface';

@Component({
  selector: 'app-home-listar',
  imports: [CategoryComponent, FoodMenuComponent, HeaderPageComponent],
  templateUrl: './home-listar.component.html',
  styleUrl: './home-listar.component.scss',
  animations: [fade],
})
export class HomeListarComponent implements OnInit {
  public foodService = inject(FoodService);
  public categoryService = inject(CategoryService);

  public foods = signal<iFood[]>([]);
  public categories = signal<iCategory[]>([]);

  ngOnInit() {
    this.getAllFoodAndCategories();
  }

  private async getAllFoodAndCategories() {
    const [foods, categories] = await Promise.all([
      this.foodService.getAllFoods(),
      this.categoryService.getAll<iCategory>(),
    ]);

    this.foods.set(foods);
    this.categories.set(categories);
  }

}
