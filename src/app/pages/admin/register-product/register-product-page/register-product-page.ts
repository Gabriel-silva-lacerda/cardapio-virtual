import { Component, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseSearchPaginatedComponent } from '@shared/components/base-search-paginated/base-search-paginated.component';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { ListRegisterPageLayoutComponent } from '@shared/components/list-register-page-layout/list-register-page-layout.component';
import { PageLayoutAdminComponent } from '@shared/components/page-layout-admin/page-layout-admin.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { IFoodAdmin } from '@shared/interfaces/food/food.interface';
import { FoodAdminViewService } from '@shared/services/food/food-admin-view.service';
import { FoodService } from '@shared/services/food/food.service';
import { ImageService } from '@shared/services/image/image.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { getImageUrl } from '@shared/utils/get-image/get-image.utits';
import { AddEditItemDialogComponent } from '../components/add-edit-item-dialog/add-edit-item-dialog.component';
import { fadeScale } from '@shared/utils/animations.util';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { AddEditCategoryDialogComponent } from '../../register-category/components/add-edit-category-dialog/add-edit-category-dialog.component';
import { AddEditSubcategoryDialogComponent } from '../../register-subcategory/components/add-edit-subcategory-dialog/add-edit-subcategory-dialog.component';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { CompanyService } from '@shared/services/company/company.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, IconButtonComponent, ListRegisterPageLayoutComponent, FormsModule, CommonModule],
  templateUrl: './register-product-page.html',
  styleUrl: './register-product-page.scss',
  animations: [fadeScale],

})
export class RegisterProductPage extends BaseSearchPaginatedComponent<IFoodAdmin> {
  private foodService = inject(FoodService);
  private dialog = inject(MatDialog);
  private foodAdminViewService = inject(FoodAdminViewService);
  private loadingService = inject(LoadingService);
  private imageService = inject(ImageService);
  private toast = inject(ToastService);
  private categoryService = inject(CategoryService);
  private companyService = inject(CompanyService);;

  public isOpen = signal(false);
  public loading = signal(false);
  public categories = signal<iCategory[]>([]);
  public selectedCategoryId = signal<string | null>(null);

  constructor() {
    super();
  }

  async ngOnInit() {
    this.getCategories();

     // Recarrega os dados quando trocar a categoria
  }

  private async getCategories() {
    try {
      const categories = await this.categoryService.getAllByField<iCategory>(
        'company_id',
        this.companyService.companyId()
      );
      this.categories.set(categories);

      if (categories.length) {
        this.selectedCategoryId.set(categories[0].id);
      }
    } finally {
    }
  }

  onCategorySelected(categoryId: string | null) {
    this.selectedCategoryId.set(categoryId);
    this.search(this.searchQuery$.getValue(), true);
  }

  protected async fetchData(query: string, page: number, pageSize: number): Promise<IFoodAdmin[]> {
    const categoryId = this.selectedCategoryId();

    const result = await this.foodAdminViewService.searchPaginated2<IFoodAdmin>(
      query,
      ['name', 'description', 'category_name'],
      page,
      pageSize,
      '*',
      categoryId ? { category_id: categoryId } : {}
    );

    return this.addImageUrls(result);
  }

  private async addImageUrls(foods: IFoodAdmin[]): Promise<IFoodAdmin[]> {
    return foods.map(this.formatFood);
  }

  private formatFood(food: IFoodAdmin): IFoodAdmin {
    return {
      ...food,
      image_url: getImageUrl(food.image_url || ''),
    };
  }

  openCategoryDialog(category?: iCategory | undefined): void {
    const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
      width: '400px',
      data: category,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if (result) this.getAllCategories();
    });
  }

  public openDialogFood(food?: IFoodAdmin): void {
    const dialogRef = this.dialog.open(AddEditItemDialogComponent, {
      width: '400px',
      height: '739px',
      data: { foodId: food?.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.updateItemList(result);
    });
  }

  private updateItemList(newFood: IFoodAdmin): void {
    this.items.update((currentItems) => {
      const updated = this.formatFood(newFood);
      const index = currentItems.findIndex(item => item.id === newFood.id);

      const newList = index !== -1
        ? currentItems.map(item => (item.id === newFood.id ? updated : item))
        : [updated, ...currentItems];

      this.hasMoreData.set(newList.length >= this.pageSize);

      return newList;
    });
  }

  public openDialogRemoveFood(food: IFoodAdmin): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Excluir Item',
        message: 'Tem certeza que deseja excluir este item?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirm: () => this.removeFood(food, dialogRef),
      },
    });
  }

  private async removeFood(food: IFoodAdmin, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
    try {
      this.loadingService.showLoading();

      const imagePath = food.image_url?.replace(/^.*\/food-images\//, 'food-images/');
      const deletedImage = imagePath ? await this.imageService.deleteImage(imagePath) : true;
      if(food.id !== undefined) {
        const error = await this.foodService.delete(food.id);

        if (!error && deletedImage) {
          this.toast.success('Item deletado com sucesso!');
          this.deleteItemFromList(food.id);
          dialogRef.close(true);
        }
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private deleteItemFromList(id: string): void {
    this.items.update(currentItems => {
      const updated = currentItems.filter(item => item.id !== id);
      this.hasMoreData.set(updated.length >= this.pageSize);
      return updated;
    });
  }
}

