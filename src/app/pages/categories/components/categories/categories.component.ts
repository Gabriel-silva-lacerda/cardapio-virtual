import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iCategory } from 'src/app/pages/home/interfaces/category.interface';
import { CategoryService } from 'src/app/pages/home/services/category.service';
import { CompanyService } from '@shared/services/company/company.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, LoadingComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  @Input() category!: iCategory;
  @Input() customClass!: string;
  @Input() showItem = false;

  private localStorageService = inject(LocalStorageService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  public loadingService = inject(LoadingService);
  public isLoading = signal<boolean>(false);
  public isAdmin = this.authService.isAdmin;
  public existingAssociation!: boolean;
  public isCategoryAssociatedMap: { [key: number]: boolean } = {};

  public companyId = this.localStorageService.getSignal('companyId', 0);
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );

  async ngOnInit() {
    this.getCategoryAssociations();
  }

  async addCategoryToCompany(categoryId: number) {
    this.loadingService.showLoading();
    try {
      const data = {
        company_id: this.companyId(),
        category_id: categoryId
      }

      await this.categoryService.insert('company_categories', data);
      this.isCategoryAssociatedMap[categoryId] = true;

      this.toastr.success("Categoria foi adicionada com sucesso")
    } finally {
      this.loadingService.hideLoading()
    }
  }

  async removeCategoryFromCompany(categoryId: number) {
    this.loadingService.showLoading();
    try {

      await this.categoryService.deleteByFilter('company_categories', {
        company_id: this.companyId(),
        category_id: categoryId,
      });

      delete this.isCategoryAssociatedMap[categoryId];

      this.toastr.success('Categoria removida com sucesso!');
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private async getCategoryAssociations(): Promise<void> {
    this.isLoading.set(true);

    try {
      const associatedCategories = await this.categoryService.getAssociatedCategories(this.companyId());

      associatedCategories.forEach(category => {
        this.isCategoryAssociatedMap[category.id] = true;
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  public trackById(index: number, item: iCategory): number {
    return item.id;
  }
}
