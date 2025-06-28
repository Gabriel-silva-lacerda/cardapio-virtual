import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseSearchPaginatedComponent } from '@shared/components/base-search-paginated/base-search-paginated.component';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PageLayoutAdminComponent } from '@shared/components/page-layout-admin/page-layout-admin.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { iFoodWithCategorySubcategory } from '@shared/interfaces/group/group-food.interface';
import { FoodAdminViewService } from '@shared/services/food/food-admin-view.service';
import { FoodService } from '@shared/services/food/food.service';
import { ImageService } from '@shared/services/image/image.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { getImageUrl } from '@shared/utils/get-image/get-image.utits';
import { AddEditItemDialogComponent } from 'src/app/pages/client/menu/components/add-edit-item-dialog/add-edit-item-dialog.component';

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, IconButtonComponent, SearchInputComponent, LoadingComponent],
  templateUrl: './register-product-page.html',
  styleUrl: './register-product-page.scss'
})
export class RegisterProductPage extends BaseSearchPaginatedComponent<iFoodWithCategorySubcategory> {
  private foodService = inject(FoodService);
  private dialog = inject(MatDialog);
  private foodAdminViewService = inject(FoodAdminViewService);
  private loadingService = inject(LoadingService);
  private imageService = inject(ImageService);
  private toast = inject(ToastService);

  public loading = signal(false);

  constructor() {
    super();
  }

  protected async fetchData(query: string, page: number, pageSize: number): Promise<iFoodWithCategorySubcategory[]> {
    const result = await this.foodAdminViewService.searchPaginated<iFoodWithCategorySubcategory>(
      query,
      ['name', 'description', 'category_name'],
      page,
      pageSize
    );

    console.log('Fetched foods:', result);

    return this.addImageUrls(result);
  }

  private async addImageUrls(foods: iFoodWithCategorySubcategory[]): Promise<iFoodWithCategorySubcategory[]> {
    return foods.map(this.formatFood);
  }

  private formatFood(food: iFoodWithCategorySubcategory): iFoodWithCategorySubcategory {
    return {
      ...food,
      image_url: getImageUrl(food.image_url || ''),
    };
  }

  public openDialogFood(food?: iFoodWithCategorySubcategory): void {
    const dialogRef = this.dialog.open(AddEditItemDialogComponent, {
      width: '400px',
      height: '739px',
      data: { foodId: food?.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.updateItemList(result);
    });
  }

  private updateItemList(newFood: iFoodWithCategorySubcategory): void {
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

  public openDialogRemoveFood(food: iFoodWithCategorySubcategory): void {
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

  private async removeFood(food: iFoodWithCategorySubcategory, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
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

