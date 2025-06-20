import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade, fadeInOut, fadeScale } from '@shared/utils/animations.utils';
import { SKELETON_COUNT } from '@shared/constants/skeleton-count';
import { KeyValuePipe } from '@angular/common';
import { iCategoryGroup } from '@shared/interfaces/group/group-food.interface';
import { SubcategoriesComponent } from '@shared/components/subcategories/subcategories.component';
import { SubcategoryItemComponent } from '@shared/components/subcategory-item/subcategory-item.component';
import { FoodService } from '@shared/services/food/food.service';
import { iFood } from '@shared/interfaces/food/food.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

import { CategoryService } from '../services/category.service';
import { iCategory } from '../interfaces/category.interface';
import { CategoriesComponent } from '../../categories/components/categories/categories.component';
import { SkeletonCategoriesComponent } from '../../categories/components/skeleton-categories/skeleton-categories.component';
import { SkeletonFoodComponent } from '../../menu/components/skeleton-food/skeleton-food.component';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';
import { CompanyCategoryViewService } from '@shared/services/company/company-category-view.service';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-home-page',
  imports: [
    CategoriesComponent,
    FoodMenuComponent,
    RouterLink,
    SkeletonCategoriesComponent,
    SkeletonFoodComponent,
    KeyValuePipe,
    SubcategoriesComponent,
    SubcategoryItemComponent,
    PageLayoutClientComponent
],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade, fadeScale, fadeInOut],
})
export class HomePage implements OnInit {
  private localStorageService = inject(LocalStorageService);
  private companyCategoryViewService = inject(CompanyCategoryViewService);

  public authService = inject(AuthService);
  public foodService = inject(FoodService);
  public categoryService = inject(CategoryService);
  public groupedFoods = signal<Record<string, iCategoryGroup>>({});
  public groupedSubFoods = signal<Record<string, iFood[]>>({});
  public subcategories = signal<any>([]);
  public loading = signal(false);
  public categories = signal<iCategory[]>([]);
  public companyService = inject(CompanyService);

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
        await this.foodService.getAllFoodsGroupedByCategory(this.companyService.companyId()),
        this.companyCategoryViewService.getAllByField<iCategory>(
          'company_id',
          this.companyService.companyId()
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
