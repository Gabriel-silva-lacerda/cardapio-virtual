import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseSearchPaginatedComponent } from '@shared/components/base-search-paginated/base-search-paginated.component';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { ListRegisterPageLayoutComponent } from '@shared/components/list-register-page-layout/list-register-page-layout.component';
import { PageLayoutAdminComponent } from '@shared/components/page-layout-admin/page-layout-admin.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
import { ToastService } from '@shared/services/toast/toast.service';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';
import { AddEditSubcategoryDialogComponent } from '../components/add-edit-subcategory-dialog/add-edit-subcategory-dialog.component';
import { FoodService } from '@shared/services/food/food.service';

@Component({
  selector: 'app-register-subcategory',
  imports: [PageLayoutAdminComponent, IconButtonComponent, ListRegisterPageLayoutComponent],
  templateUrl: './register-subcategory-page.html',
  styleUrl: './register-subcategory-page.scss'
})
export class RegisterSubcategoryPage extends BaseSearchPaginatedComponent<iSubcategory> {
  private subCategoryService = inject(SubcategoryService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private foodService = inject(FoodService);
  public loading = signal(false);

  constructor() {
    super();
  }

  protected async fetchData(query: string, page: number, pageSize: number): Promise<iSubcategory[]> {
    const result = await this.subCategoryService.searchPaginated<iSubcategory>(
      query,
      ['name'],
      page,
      pageSize
    );

    return result;
  }

  openDialog(subcategory?: iSubcategory | undefined): void {
    const dialogRef = this.dialog.open(AddEditSubcategoryDialogComponent, {
      width: '400px',
      data: { subcategory },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.updateItemList(result);
    });
  }

  private updateItemList(newSubcategory: iSubcategory): void {
    this.items.update((currentItems) => {
      const index = currentItems.findIndex(item => item.id === newSubcategory.id);

      const newList = index !== -1
        ? currentItems.map(item => (item.id === newSubcategory.id ? newSubcategory : item))
        : [newSubcategory, ...currentItems];

      this.hasMoreData.set(newList.length >= this.pageSize);
      return newList;
    });
  }

  public openDialogRemoveSubcategory(subcategory: iSubcategory): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Excluir Subcategoria',
        message: 'Tem certeza que deseja excluir essa subcategoria?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirm: () => this.removeSubcategory(subcategory, dialogRef),
      },
    });
  }

  private async removeSubcategory(subcategory: iSubcategory, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
    try {
      this.loading.set(true);

      const foods = await this.foodService.getAllByField<iSubcategory>('subcategory_id', subcategory.id);

      if(foods.length > 0) {
        this.toast.warning('Não é possível excluir uma subcategoria com comidas associadas.');
        return;
      }
      const error = await this.subCategoryService.delete(subcategory.id);

      if (!error) {
        this.toast.success('Subcategoria deletada com sucesso!');
        this.deleteItemFromList(subcategory.id);
        dialogRef.close(true);
      }
    } finally {
      this.loading.set(false);
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
