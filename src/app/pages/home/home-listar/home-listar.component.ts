import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryComponent } from '../components/category/category.component';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.utils';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { FoodService } from '../../../core/shared/services/food/food.service';
import { CategoryService } from '../services/category.service';
import { iCategory } from '../interfaces/category.interface';
import { iFood } from '@shared/interfaces/food.interface';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-home-listar',
  imports: [CategoryComponent, FoodMenuComponent, HeaderPageComponent],
  templateUrl: './home-listar.component.html',
  styleUrl: './home-listar.component.scss',
  animations: [fade],
})
export class HomeListarComponent implements OnInit {
  private authService = inject(AuthService);

  public foodService = inject(FoodService);
  public categoryService = inject(CategoryService);
  public foods = signal<iFood[]>([]);
  public categories = signal<iCategory[]>([]);

  ngOnInit() {
    this.waitForUser()
  }

  private async waitForUser() {
    await this.authService.load();

    const user = this.authService.currentUser();
    if (!user) {
      return;
    }

    this.getCompanyId(user.id);
  }

  async getCompanyId(userId: string | undefined) {
    const { company_id } = await this.categoryService.getByField<{ company_id: string }>(
      'user_companies',
      'user_id',
      userId as string
    );

    this.getAllFoodAndCategories(company_id);
  }

  private async getAllFoodAndCategories(companyId: string) {
    const [foods, categories] = await Promise.all([
      this.foodService.getFoodsByCompany(+companyId),
      this.categoryService.getAllByField<iCategory>('categories', 'company_id', companyId)
    ]);

    this.foods.set(foods);
    this.categories.set(categories);
  }
}
