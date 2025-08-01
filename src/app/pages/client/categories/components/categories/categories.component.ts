import { Company } from '@shared/interfaces/company/company';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FoodApi } from '@shared/api/food/food.api';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { CompanyCategoryService } from '@shared/services/company/company-category.service';
import { CompanyCategoryViewService } from '@shared/services/company/company-category-view.service';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, LoadingComponent, LoadingScreenComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  @Input() category!: iCategory;
  @Input() customClass!: string;
  @Input() showItem = false;

  private localStorageService = inject(LocalStorageService);
  private categoryService = inject(CategoryService);
  private foodApi = inject(FoodApi);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  private companyCategoryService = inject(CompanyCategoryService);
  private companyCategoryViewService = inject(CompanyCategoryViewService);

  public loading = signal({
    getCategories: false,
    setCategories: false,
  });
  public loadingService = inject(LoadingService);
  public isAdmin = this.authService.isAdmin;
  public existingAssociation!: boolean;
  public isCategoryAssociatedMap: Record<string, boolean> = {};

  public companyId = this.localStorageService.getSignal('companyId', '0');
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );

  async ngOnInit() {
    this.getCategoryAssociations();
  }

  async addCategoryToCompany(categoryId: string) {
    this.loading.update((l) => ({ ...l, setCategories: true }));
    try {
      const data = {
        company_id: this.companyId(),
        category_id: categoryId,
      };

      await this.companyCategoryService.insert(data);

      this.isCategoryAssociatedMap[categoryId] = true;

      this.toast.success('Categoria foi adicionada com sucesso');
    } finally {
      this.loading.update((l) => ({ ...l, setCategories: false }));
    }
  }

  async removeCategoryFromCompany(categoryId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Excluir Categoria',
        message: 'Tem certeza que deseja excluir essa categoria?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            this.loadingService.showLoading();

            const groupedCategory =
              await this.foodApi.getFoodsGroupedByCategoryId(categoryId);

            const hasFoods = groupedCategory?.subcategories?.some(
              (subcategory) => subcategory.foods.length > 0
            );

            if (hasFoods) {
              this.toast.warning(
                'Não é possível excluir a categoria pois há comidas associadas a ela.'
              );
              return;
            }

            await this.companyCategoryService.deleteByFilter({
              company_id: this.companyId(),
              category_id: categoryId,
            });

            delete this.isCategoryAssociatedMap[categoryId];

            this.toast.success('Categoria removida com sucesso!');
            dialogRef.close(true);
          } finally {
            this.loadingService.hideLoading();
          }
        },
      },
    });
  }

  private async getCategoryAssociations(): Promise<void> {
    this.loading.update((l) => ({ ...l, getCategories: true }));

    try {
      const categories = await this.companyCategoryViewService.getAllByField<iCategory>(
        'company_id',
        this.companyId()
      );
      // categories.forEach((category) => {
      //   this.isCategoryAssociatedMap[category.id] = true;
      // });
    } finally {
      this.loading.update((l) => ({ ...l, getCategories: false }));
    }
  }

  // public trackById(index: number, item: iCategory): number {
  //   return +item.id;
  // }
}
