import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade, fadeInOut, fadeScale } from '@shared/utils/animations.utils';
import { SKELETON_COUNT } from '@shared/constants/skeleton-count';
import { SubcategoriesComponent } from '@shared/components/subcategories/subcategories.component';
import { SubcategoryItemComponent } from '@shared/components/subcategory-item/subcategory-item.component';
import { FoodService } from '@shared/services/food/food.service';
import { iCategory } from '../interfaces/category.interface';
import { CategoriesComponent } from '../../categories/components/categories/categories.component';
import { SkeletonCategoriesComponent } from '../../categories/components/skeleton-categories/skeleton-categories.component';
import { SkeletonFoodComponent } from '../../menu/components/skeleton-food/skeleton-food.component';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';
import { CompanyService } from '@shared/services/company/company.service';
import { FullMenuViewService } from '@shared/services/full-menu/full-menu-view.service';
import { iSubcategoryWithFoods } from '@shared/interfaces/subcategory/subcategory.interface';
import { TesteService } from '@shared/services/full-menu/teste.service';
import { iFullMenu } from '@shared/interfaces/full-menu/full-menu.interface';

@Component({
  selector: 'app-home-page',
  imports: [
    CategoriesComponent,
    FoodMenuComponent,
    RouterLink,
    SkeletonCategoriesComponent,
    SkeletonFoodComponent,
    SubcategoriesComponent,
    SubcategoryItemComponent,
    PageLayoutClientComponent
],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade, fadeScale, fadeInOut],
})
export class HomePage implements OnInit {
  private fullMenuViewService = inject(FullMenuViewService);
  public authService = inject(AuthService);
  public foodService = inject(FoodService);
  public subcategories = signal<iSubcategoryWithFoods[]>([]);
  public loading = signal(false);
  public categories = signal<iCategory[]>([]);
  public companyService = inject(CompanyService);
  public fullMenu = signal<iFullMenu[]>([]);

  async ngOnInit() {
    sessionStorage.removeItem('paymentRedirect');
    this.getFullMenu();
  }

  get skeletonItems(): number[] {
    return Array.from({ length: SKELETON_COUNT });
  }

  private async getFullMenu() {
    this.loading.set(true);
    try {
      const fullMenu = await this.fullMenuViewService.fullMenu(this.companyService.companyId());
      this.fullMenu.set(fullMenu);
      this.setSubcategoriesFrom(fullMenu);
      this.categoriesOnly(fullMenu);
    } finally {
      this.loading.set(false);
    }
  }

  private setSubcategoriesFrom(menu: iFullMenu[]): void {
    const allSubcategories = menu.flatMap(c => c.subcategories).filter(Boolean);
    this.subcategories.set(allSubcategories);
  }

  private categoriesOnly(fullMenu: iFullMenu[]): void {
    this.categories.set(fullMenu.map(c => ({
      id: c.category_id,
      name: c.category_name,
      icon: c.category_icon,
    })));
  }

}
