import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade, fadeScale } from '@shared/utils/animations.utils';
import { iCategoryWithSubcategories } from '@shared/interfaces/food/food.interface';
import { firstValueFrom } from 'rxjs';
import { SkeletonFoodComponent } from '../components/skeleton-food/skeleton-food.component';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@shared/services/company/company.service';
import { SubcategoriesComponent } from '@shared/components/subcategories/subcategories.component';
import { iSubcategoryWithFoods } from '@shared/interfaces/subcategory/subcategory.interface';
import { SubcategoryItemComponent } from '@shared/components/subcategory-item/subcategory-item.component';
import { SkeletonSubcategoriesComponent } from '../components/skeleton-subcategories/skeleton-subcategories.component';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';
import { FullMenuViewService } from '@shared/services/company/full-menu-view.service';

@Component({
  selector: 'app-food-page',
  imports: [
    FoodMenuComponent,
    SkeletonFoodComponent,
    FormsModule,
    SubcategoriesComponent,
    SubcategoryItemComponent,
    SkeletonSubcategoriesComponent,
    PageLayoutClientComponent
],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.scss',
  animations: [fade, fadeScale],
})
export class MenuPage {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private fullMenuViewService = inject(FullMenuViewService);

  public title = signal<string>('');
  public id!: string | null;
  public subcategories = signal<iSubcategoryWithFoods[]>([]);
  public loading = signal(false);
  public fullMenu = signal<iCategoryWithSubcategories[]>([]);
  public selectedCategory = signal<iCategoryWithSubcategories | null>(null);

  ngOnInit(): void {
    this.getFullMenu();
  }

  private async getFullMenu(): Promise<void> {
    this.loading.set(true);
    try {
      const paramMap = await firstValueFrom(this.route.paramMap);
      this.id = paramMap.get('id');

      const fullMenu = await this.fullMenuViewService.fullMenu(this.companyService.companyId());
      this.fullMenu.set(fullMenu);

      this.updateSelectedCategory(fullMenu);
      this.updateSubcategories(fullMenu);

      const categoryTitle = this.selectedCategory()?.category_name ?? 'Cardápio';
      this.title.set(categoryTitle);

    } finally {
      this.loading.set(false);
    }
  }

  private updateSelectedCategory(fullMenu: iCategoryWithSubcategories[]): void {
    const selected = fullMenu.find(c => c.category_id === this.id) ?? null;
    this.selectedCategory.set(selected);
  }

  private updateSubcategories(fullMenu: iCategoryWithSubcategories[]): void {
    const subcategories = this.id
      ? fullMenu.find(c => c.category_id === this.id)?.subcategories ?? []
      : fullMenu.flatMap(c => c.subcategories);

    this.subcategories.set(subcategories);
  }

}
