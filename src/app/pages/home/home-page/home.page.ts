import { Component, inject, OnInit, signal } from '@angular/core';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.utils';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { FoodService } from '../../../core/shared/services/food/food.service';
import { CategoryService } from '../services/category.service';
import { iCategory } from '../interfaces/category.interface';
import { iFood } from '@shared/interfaces/food/food.interface';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CategoriesComponent } from '../../categories/components/categories/categories.component';
import { LoadingService } from '@shared/services/loading/loading.service';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { SkeletonCategoriesComponent } from '../../categories/components/skeleton-categories/skeleton-categories.component';
import { SKELETON_COUNT } from '@shared/constants/skeleton-count';
import { SkeletonFoodComponent } from '../../food/components/skeleton-food/skeleton-food.component';
import { KeyValuePipe, NgClass } from '@angular/common';
import { iCategoryGroup } from '@shared/interfaces/group/group-food.interface';
import { SubcategoriesComponent } from '@shared/components/subcategories/subcategories.component';
import { SubcategoryItemComponent } from '@shared/components/subcategory-item/subcategory-item.component';

@Component({
  selector: 'app-home-page',
  imports: [
    CategoriesComponent,
    FoodMenuComponent,
    HeaderPageComponent,
    RouterLink,
    SkeletonLoaderComponent,
    SkeletonCategoriesComponent,
    SkeletonFoodComponent,
    NgClass,
    KeyValuePipe,
    SubcategoriesComponent,
    SubcategoryItemComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade],
})
export class HomePage implements OnInit {
  private localStorageService = inject(LocalStorageService);

  public loadingService = inject(LoadingService);
  public foodService = inject(FoodService);
  public categoryService = inject(CategoryService);
  public groupedFoods = signal<Record<string, iCategoryGroup>>({});
  public groupedSubFoods = signal<Record<string, iFood[]>>({});
  public subcategories = signal<any>([]);
  public loading = signal(false);

  public categories = signal<iCategory[]>([]);
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );
  public companyId = this.localStorageService.getSignal('companyId', '0');

  ngOnInit() {
    this.getAllFoodAndCategories();
    this.getSubCategories();
    sessionStorage.removeItem('paymentRedirect');
  }

  get skeletonItems(): number[] {
    return Array.from({ length: SKELETON_COUNT });
  }

  private async getAllFoodAndCategories() {
    try {
      this.loading.set(true);

      const [foods, categories] = await Promise.all([
        await this.foodService.getAllFoodsGroupedByCategory(this.companyId()),
        this.categoryService.getAllByField<iCategory>(
          'company_categories_view',
          'company_id',
          this.companyId()
        ),
      ]);

      this.groupedFoods.set(foods);
      this.categories.set(categories);
    } finally {
      this.loading.set(false);
    }
  }

  private async getSubCategories() {
    this.subcategories.set(await this.categoryService.getSubcategories());
  }
}
