import { NgFor } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseSearchPaginatedComponent } from '@shared/components/base-search-paginated/base-search-paginated.component';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PageLayoutAdminComponent } from '@shared/components/page-layout-admin/page-layout-admin.component';
import { ListRegisterPageLayoutComponent } from '@shared/components/list-register-page-layout/list-register-page-layout.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { ImageService } from '@shared/services/image/image.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { AddEditCategoryDialogComponent } from '../components/add-edit-category-dialog/add-edit-category-dialog.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';

@Component({
  selector: 'app-register-category',
  imports: [PageLayoutAdminComponent, IconButtonComponent, ListRegisterPageLayoutComponent],
  templateUrl: './register-category.page.html',
  styleUrl: './register-category.page.scss'
})
export class RegisterCategoryPage extends BaseSearchPaginatedComponent<iCategory> {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private subCategoryService = inject(SubcategoryService);
  public loading = signal(false);

  constructor() {
    super();
  }

  protected async fetchData(query: string, page: number, pageSize: number): Promise<iCategory[]> {
    const result = await this.categoryService.searchPaginated<iCategory>(
      query,
      ['name'],
      page,
      pageSize
    );

    return result;
  }

  openDialog(category?: iCategory | undefined): void {
    const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
      width: '400px',
      data: category,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.updateItemList(result);
    });
  }

  private updateItemList(newCategory: iCategory): void {
    this.items.update((currentItems) => {
      const index = currentItems.findIndex(item => item.id === newCategory.id);

      const newList = index !== -1
        ? currentItems.map(item => (item.id === newCategory.id ? newCategory : item))
        : [newCategory, ...currentItems];

      this.hasMoreData.set(newList.length >= this.pageSize);
      return newList;
    });
  }

  public openDialogRemoveCategory(category: iCategory): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Excluir Categoria',
        message: 'Tem certeza que deseja excluir essa categoria?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        // onConfirm: () => this.removeCategory(category, dialogRef),
      },
    });
  }

  // private async removeCategory(category: iCategory, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
  //   try {
  //     this.loading.set(true);

  //     const subcategories = await this.subCategoryService.getAllByField<iSubcategory>('category_id', category.id);

  //     if(subcategories.length > 0) {
  //       this.toast.warning('Não é possível excluir uma categoria com subcategorias associadas.');
  //       return;
  //     }

  //     const error = await this.categoryService.delete(category.id);

  //     if (!error) {
  //       this.toast.success('Categoria deletada com sucesso!');
  //       this.deleteItemFromList(category.id);
  //       dialogRef.close(true);
  //     }
  //   } finally {
  //     this.loading.set(false);
  //   }
  // }

  private deleteItemFromList(id: string): void {
    this.items.update(currentItems => {
      const updated = currentItems.filter(item => item.id !== id);
      this.hasMoreData.set(updated.length >= this.pageSize);
      return updated;
    });
  }
}
