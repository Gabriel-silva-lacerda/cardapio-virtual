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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home-listar',
  imports: [CategoryComponent, FoodMenuComponent, HeaderPageComponent],
  templateUrl: './home-listar.component.html',
  styleUrl: './home-listar.component.scss',
  animations: [fade],
})
export class HomeListarComponent implements OnInit {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  public foodService = inject(FoodService);
  public categoryService = inject(CategoryService);
  public foods = signal<iFood[]>([]);
  public categories = signal<iCategory[]>([]);


  ngOnInit() {
    this.waitForCompany();
  }

  private async waitForCompany() {
    const unique_url = this.route.snapshot.queryParams['empresa'];

    if (!unique_url) {
      console.error('URL da empresa não encontrada');
      return;
    }
    const companyId = await this.getCompanyId(unique_url);

    if (companyId)
    this.getAllFoodAndCategories(companyId);
  }

  private async getCompanyId(unique_url: string): Promise<string | null> {
    const company = await this.companyService.getByField<{ id: string }>(
      'companies',
      'unique_url',
      unique_url,
      'id'
    );

    if (!company) {
      console.error('Empresa não encontrada');
      return null;
    }

    return company.id;
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
