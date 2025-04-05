import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';
import { CategoriesComponent } from '../components/categories/categories.component';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CompanyService } from '@shared/services/company/company.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { SKELETON_COUNT } from '@shared/constants/skeleton-count';
import { SkeletonCategoriesComponent } from '../components/skeleton-categories/skeleton-categories.component';
import { fade } from '@shared/utils/animations.utils';

@Component({
  selector: 'app-categories-page',
  imports: [HeaderPageComponent, CategoriesComponent, SkeletonLoaderComponent, SkeletonCategoriesComponent],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
  animations: [fade]
})
export class CategoriesPage implements OnInit {
  private categoryService = inject(CategoryService);
  private localStorageService = inject(LocalStorageService);

  public loadingService = inject(LoadingService);
  public categories = signal<iCategory[]>([]);
  public companyId = this.localStorageService.getSignal('companyId', 0);
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  ngOnInit(): void {
    this.getCategories();
  }

  get skeletonItems(): number[] {
    return Array.from({ length: SKELETON_COUNT });
  }

  async getCategories() {
    this.loadingService.showLoading();

    try {
      const categories = await this.categoryService.getAll<iCategory>('categories');
      this.categories.set(categories);
    } finally {
      this.loadingService.hideLoading();
    }
  }
}
