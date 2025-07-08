import { NgFor } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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

@Component({
  selector: 'app-register-category',
  imports: [PageLayoutAdminComponent, IconButtonComponent, LoadingComponent, SearchInputComponent, ListRegisterPageLayoutComponent],
  templateUrl: './register-category.page.html',
  styleUrl: './register-category.page.scss'
})
export class RegisterCategoryPage extends BaseSearchPaginatedComponent<iCategory> {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private imageService = inject(ImageService);

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

        console.log('Fetched categories:', result);
    return result;
    // return this.addImageUrls(result);
  }

  openDialog() {

  }
  // private async addImageUrls(categories: iCategory[]): Promise<iCategory[]> {
  //   return categories.map(this.formatCategory);
  // }

  // private formatCategory(category: iCategory): iCategory {
  //   return {
  //     ...category,
  //     image_url: getImageUrl(category.image_url || ''),
  //   };
  // }

  // public openDialogCategory(category?: iCategory): void {
  //   const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
  //     width: '400px',
  //     height: '620px',
  //     data: { categoryId: category?.id },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) this.updateItemList(result);
  //   });
  // }

  // private updateItemList(newCategory: iCategory): void {
  //   this.items.update((currentItems) => {
  //     // const updated = this.formatCategory(newCategory);
  //     const index = currentItems.findIndex(item => item.id === newCategory.id);

  //     const newList = index !== -1
  //       ? currentItems.map(item => (item.id === newCategory.id ? updated : item))
  //       : [updated, ...currentItems];

  //     this.hasMoreData.set(newList.length >= this.pageSize);
  //     return newList;
  //   });
  // }

  // public openDialogRemoveCategory(category: iCategory): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Excluir Categoria',
  //       message: 'Tem certeza que deseja excluir esta categoria?',
  //       confirmText: 'Excluir',
  //       cancelText: 'Cancelar',
  //       onConfirm: () => this.removeCategory(category, dialogRef),
  //     },
  //   });
  // }

  // private async removeCategory(category: iCategory, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
  //   try {
  //     this.loading.set(true);

  //     const imagePath = category.image_url?.replace(/^.*\/category-images\//, 'category-images/');
  //     const deletedImage = imagePath ? await this.imageService.deleteImage(imagePath) : true;

  //     if (category.id !== undefined) {
  //       const error = await this.categoryService.delete(category.id);

  //       if (!error && deletedImage) {
  //         this.toast.success('Categoria deletada com sucesso!');
  //         this.deleteItemFromList(category.id);
  //         dialogRef.close(true);
  //       }
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
