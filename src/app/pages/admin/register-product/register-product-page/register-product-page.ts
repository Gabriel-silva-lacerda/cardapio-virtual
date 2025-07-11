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
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { SelectDropdownComponent } from '@shared/components/select-dropdown/select-dropdown.component';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';
import { TesteService } from '@shared/services/full-menu/teste.service';
import { FilterByFieldPipe } from "../../../../widget/pipes/filter-by-field.pipe";
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, FormsModule, CommonModule, FilterByFieldPipe, SearchInputComponent],
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
  private subcategoryService = inject(SubcategoryService);

  public isOpen = signal(false);
  public loading = signal(false);
  public selectedCategoryId = signal<string | null>(null);
  public selectedSubcategoryId = signal<string | null>(null);
  public categories = signal<iCategory[]>([]);
  public subcategories = signal<iSubcategory[]>([]);

  constructor() {
    super();
  }

  async ngOnInit() {
    await this.initializeData();
  }

  private async initializeData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([this.getCategories(), this.getSubcategories()]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async getCategories(): Promise<void> {
    const categories = await this.categoryService.getAllByField<iCategory>(
      'company_id',
      this.companyService.companyId(),
      'id, name'
    );
    this.categories.set(categories);
  }

  private async getSubcategories(): Promise<void> {
    const subcategories = await this.subcategoryService.getAllByField<iSubcategory>(
      'company_id',
      this.companyService.companyId(),
      'id, name, category_id'
    );
    this.subcategories.set(subcategories);
  }

  protected async fetchData(query: string, page: number, pageSize: number): Promise<IFoodAdmin[]> {
    const result = await this.foodAdminViewService.searchPaginated2<IFoodAdmin>(
      query,
      ['name', 'description'],
      page,
      pageSize,
      '*',
      {
        company_id: this.companyService.companyId(),
      }
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
    //  if (result) this.getCategories();
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

