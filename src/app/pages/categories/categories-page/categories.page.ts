import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';
import { CategoriesComponent } from '../components/categories/categories.component';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { SKELETON_COUNT } from '@shared/constants/skeleton-count';
import { SkeletonCategoriesComponent } from '../components/skeleton-categories/skeleton-categories.component';
import { fade } from '@shared/utils/animations.utils';
import { SubcategoryDialogComponent } from '../components/subcategory-dialog/subcategory-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-categories-page',
  imports: [
    HeaderPageComponent,
    CategoriesComponent,
    SkeletonCategoriesComponent,
  ],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
  animations: [fade],
})
export class CategoriesPage implements OnInit {
  private categoryService = inject(CategoryService);
  private localStorageService = inject(LocalStorageService);
  private dialog = inject(MatDialog);

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

  openDialogSubcategory() {
    const dialogRef = this.dialog.open(SubcategoryDialogComponent, {
      width: '400px',
      data: this.categories,
    });
  }
}
