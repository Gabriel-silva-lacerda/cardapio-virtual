import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriesComponent } from '../components/categories/categories.component';
import { SkeletonCategoriesComponent } from '../components/skeleton-categories/skeleton-categories.component';
import { fade } from '@shared/utils/animations.util';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';
import { CompanyCategoryViewService } from '@shared/services/company/company-category-view.service';
import { CompanyService } from '@shared/services/company/company.service';
import { iCategory } from '@shared/interfaces/category/category.interface';

@Component({
  selector: 'app-categories-page',
  imports: [
    CategoriesComponent,
    SkeletonCategoriesComponent,
    PageLayoutClientComponent
],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
  animations: [fade],
})
export class CategoriesPage implements OnInit {
  private companyCategoryViewService = inject(CompanyCategoryViewService);
  private companyService = inject(CompanyService);
  public loading = signal(false);
  public categories = signal<iCategory[]>([]);

  ngOnInit(): void {
    this.getCategories();
  }

  async getCategories() {
    this.loading.set(true);

    try {
      const categories = await this.companyCategoryViewService.getAllByField<iCategory>(
        'company_id',
        this.companyService.companyId()
      );
      this.categories.set(categories);
    } finally {
      this.loading.set(false);
    }
  }

}
