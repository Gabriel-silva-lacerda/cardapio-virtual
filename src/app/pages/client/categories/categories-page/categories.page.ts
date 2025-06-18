import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';
import { CategoriesComponent } from '../components/categories/categories.component';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { SkeletonCategoriesComponent } from '../components/skeleton-categories/skeleton-categories.component';
import { fade } from '@shared/utils/animations.utils';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';

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
  private categoryService = inject(CategoryService);
  private localStorageService = inject(LocalStorageService);

  public loading = signal(false);
  public categories = signal<iCategory[]>([]);
  public companyId = this.localStorageService.getSignal('companyId', 0);
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );

  ngOnInit(): void {
    this.getCategories();
  }

  async getCategories() {
    this.loading.set(true);

    try {
      const categories = await this.categoryService.getAll<iCategory>(
        'categories'
      );
      this.categories.set(categories);
    } finally {
      this.loading.set(false);
    }
  }

}
