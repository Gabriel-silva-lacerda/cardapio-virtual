import { Component, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, IconButtonComponent, ListRegisterPageLayoutComponent],
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
  public isOpen = signal(false);

  public loading = signal(false);

  constructor() {
    super();
  }

  protected async fetchData(query: string, page: number, pageSize: number): Promise<IFoodAdmin[]> {
    const result = await this.foodAdminViewService.searchPaginated<IFoodAdmin>(
      query,
      ['name', 'description', 'category_name'],
      page,
      pageSize
    );

    console.log('Fetched foods:', result);

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

