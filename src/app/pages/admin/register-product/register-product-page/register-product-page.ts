import { CurrencyPipe, NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BaseSearchPaginatedComponent } from '@shared/components/base-search-paginated/base-search-paginated.component';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PageLayoutAdminComponent } from '@shared/components/page-layout-admin/page-layout-admin.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { iFood } from '@shared/interfaces/food/food.interface';
import { iFoodWithCategorySubcategory } from '@shared/interfaces/group/group-food.interface';
import { CompanyService } from '@shared/services/company/company.service';
import { FoodCategoriesViewService } from '@shared/services/food/food-categories-view.service';
import { FoodService } from '@shared/services/food/food.service';
import { BehaviorSubject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, IconButtonComponent, SearchInputComponent, LoadingComponent],
  templateUrl: './register-product-page.html',
  styleUrl: './register-product-page.scss'
})
export class RegisterProductPage extends BaseSearchPaginatedComponent<iFoodWithCategorySubcategory> {
  private foodService = inject(FoodService);
  private companyService = inject(CompanyService);
  private foodsCategoriesView = inject(FoodCategoriesViewService);

  public foods = signal<iFoodWithCategorySubcategory[]>([]);
  public loading = signal(false);
  public filteredFoods = signal<iFoodWithCategorySubcategory[]>([]);

  constructor() {
    super();
  }

  ngOnInit() {
    this.getAllFoods();
    this.init();
  }

  async getAllFoods() {
    const foods = await this.foodsCategoriesView.getAllByField<iFoodWithCategorySubcategory>('company_id', this.companyService.companyId());
    this.foods.set(foods);
  }

  protected fetchData(query: string, page: number, pageSize: number): Promise<iFoodWithCategorySubcategory[]> {
    return this.foodService.searchPaginated(query, ['name', 'description'], page, pageSize);
  }

  onScrollEnd() {
    this.loadMore();
  }

  onAdd() {
    // abrir modal ou navegar para página de criação
  }

  editFood(food: iFood) {
    // abrir modal ou navegar para edição
  }

  async deleteFood(food: iFood) {
    if (confirm(`Tem certeza que deseja excluir "${food.name}"?`)) {
      if(food.id) await this.foodService.delete(food.id);
      this.getAllFoods();
    }
  }
}
