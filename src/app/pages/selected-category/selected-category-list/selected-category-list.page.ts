import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.utils';
import { iFood } from '@shared/interfaces/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';

@Component({
  selector: 'app-selected-category-list',
  imports: [FoodMenuComponent, HeaderPageComponent],
  templateUrl: './selected-category-list.page.html',
  styleUrl: './selected-category-list.page.scss',
  animations: [fade],
})
export class SelectedCategoryListPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private categoryService = inject(CategoryService);

  public foods = signal<iFood[] | null>(null);
  public title = signal<string>('');
  public id!: string | null;

  ngOnInit(): void {
    this.getRouteId();
  }

  private async getRouteId(): Promise<void> {
    this.id = await firstValueFrom(this.route.paramMap).then((params) =>
      params.get('id')
    );

    if (this.id) this.getFoodsByCategory(+this.id);
  }

  public async getFoodsByCategory(id: number) {
    const foods = await this.foodService.getFoodsByCategory(id);
    const category = await this.categoryService.getById<iCategory>(id);

    if (!category) {
      console.error('Categoria não encontrada');
      return;
    }

    this.title.set(category.name);
    this.foods.set(foods);
  }
}
