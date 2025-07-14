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
import { CommonModule, NgClass, NgFor } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';
import { FilterByFieldPipe } from "../../../../widget/pipes/filter-by-field.pipe";
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { debounceTime, Subject } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { openConfirmDialog } from '@shared/utils/dialog/dialog.util';

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, FormsModule, CommonModule, LoadingComponent, FilterByFieldPipe, SearchInputComponent, IconButtonComponent],
  templateUrl: './register-product-page.html',
  styleUrl: './register-product-page.scss',
  animations: [fadeScale],

})
export class RegisterProductPage {
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
  public expandedSubcategories = signal<Record<string, boolean>>({});
  public foodsBySubcategory = signal<Record<string, any[]>>({});
  private searchSubject = new Subject<{ subcategoryId: string; query: string }>();
  public loadingFoodsBySubcategory = signal<Record<string, boolean>>({});

  async ngOnInit() {
    await this.initializeData();
    this.searchSubject.pipe(debounceTime(500)).subscribe(({ subcategoryId, query }) => {
      this.getFoodsBySubcategory(subcategoryId, query);
    });
  }

  private async initializeData(): Promise<void> {
    this.loading.set(true);
    try {
      await Promise.all([this.getCategories(), this.getSubcategories()]);
    } finally {
      this.loading.set(false);
    }
  }

  private async getCategories(): Promise<void> {
    const categories = await this.categoryService.getAllByField<iCategory>(
      'company_id',
      this.companyService.companyId(),
      '*',
      { orderBy: 'created_at', ascending: false }
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

  async toggleSubcategory(subcategoryId: string) {
    const expandedMap: Record<string, boolean> = {};

    const isCurrentlyOpen = this.expandedSubcategories()[subcategoryId];
    if (!isCurrentlyOpen) {
      expandedMap[subcategoryId] = true;
      this.expandedSubcategories.set(expandedMap);

      if (!this.foodsBySubcategory()[subcategoryId]) {
        await this.getFoodsBySubcategory(subcategoryId, '');
      }
    } else {
      this.expandedSubcategories.set({});
    }
  }
  async getFoodsBySubcategory(subcategoryId: string, query: string) {
    this.loadingFoodsBySubcategory.update(state => ({ ...state, [subcategoryId]: true }));

    try {
      const foods = await this.getFoods(subcategoryId, query);
      this.foodsBySubcategory.update(state => ({
        ...state,
        [subcategoryId]: foods,
      }));
    } catch {
      this.toast.error('Erro ao carregar alimentos');
    } finally {
      this.loadingFoodsBySubcategory.update(state => ({ ...state, [subcategoryId]: false }));
    }
  }

  async getFoods(subcategoryId: string, query: string): Promise<IFoodAdmin[]> {
    const filters = {
      company_id: this.companyService.companyId(),
      subcategory_id: subcategoryId,
    };

    const foods = await this.foodService.search<IFoodAdmin>(
      query,
      ['name', 'description'],
      filters,
    );

    return this.addImageUrls(foods);
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

  onSubcategorySearchChange(subcategoryId: string, query: string) {
    this.searchSubject.next({ subcategoryId, query });
  }

  public openDialogDuplicateCategoryAndSubcategory(category: iCategory, subcategory: iSubcategory): void {
    openConfirmDialog<{ category: iCategory; subcategory: iSubcategory }>(this.dialog, {
      title: 'Duplicar categoria',
      message: `Deseja duplicar a categoria "${category.name}" e a subcategoria "${subcategory.name}"?`,
      confirmText: 'Duplicar',
      cancelText: 'Cancelar',
      payload: { category, subcategory },
      onConfirm: async (payload, dialogRef) => {
        if (payload) {
          await this.duplicateCategoryAndSubcategory(payload.category, payload.subcategory);
          dialogRef.close();
        }
      },
    });
  }

  private async duplicateCategoryAndSubcategory(category: iCategory, subcategory: iSubcategory): Promise<void> {
    this.loadingService.showLoading()
    try {
      const companyId = this.companyService.companyId();

      // 🔹 1. Gerar nome da nova categoria com sufixo incremental
      const baseCategoryName = this.getBaseName(category.name);
      const categoryNames = this.categories().map(c => c.name);
      const newCategoryName = this.getNextCopyName(baseCategoryName, categoryNames);

      const duplicatedCategory: Partial<iCategory> = {
        name: newCategoryName,
        company_id: companyId,
      };

      const newCategory = await this.categoryService.insert<iCategory>(duplicatedCategory);

      // 🔹 2. Gerar nome da nova subcategoria com sufixo incremental
      const baseSubcategoryName = this.getBaseName(subcategory.name);
      const subcategoryNames = this.subcategories().map(sc => sc.name);
      const newSubcategoryName = this.getNextCopyName(baseSubcategoryName, subcategoryNames);

      const duplicatedSubcategory: Partial<iSubcategory> = {
        name: newSubcategoryName,
        category_id: newCategory.id,
        company_id: companyId,
      };

      const newSubcategory = await this.subcategoryService.insert<iSubcategory>(duplicatedSubcategory);

      // 🔹 3. Duplicar os produtos da subcategoria
      const originalFoods = this.foodsBySubcategory()[subcategory.id] ?? [];
      const existingFoodNames = originalFoods.map(f => f.name);

      const duplicatedFoods: Partial<IFoodAdmin>[] = originalFoods.map(food => {
        const baseFoodName = this.getBaseName(food.name);
        const newFoodName = this.getNextCopyName(baseFoodName, existingFoodNames);
        existingFoodNames.push(newFoodName); // prevenir duplicação
        return {
          ...food,
          id: undefined,
          name: newFoodName,
          subcategory_id: newSubcategory.id,
          created_at: undefined,
          updated_at: undefined,
        };
      });

      for (const food of duplicatedFoods) {
        await this.foodService.insert<IFoodAdmin>(food);
      }

      // 🔹 4. Atualizar estado local
      this.categories.set([...this.categories(), newCategory]);
      this.subcategories.set([...this.subcategories(), newSubcategory]);

      if (duplicatedFoods.length > 0) {
        const newFoodsWithImageUrls = await this.addImageUrls(duplicatedFoods as IFoodAdmin[]);
        this.foodsBySubcategory.update(state => ({
          ...state,
          [newSubcategory.id]: newFoodsWithImageUrls,
        }));
      }

      this.toast.success('Categoria, subcategoria e produtos duplicados com sucesso!');
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private getBaseName(name: string): string {
    return name.replace(/\s+\(cópia(?: \d+)?\)$/, '').trim();
  }

  private getNextCopyName(baseName: string, existingNames: string[]): string {
    const regex = new RegExp(`^${this.escapeRegex(baseName)}\\s+\\(cópia(?:\\s(\\d+))?\\)$`, 'i');

    const copyNumbers = existingNames
      .map(name => {
        const match = name.match(regex);
        return match ? parseInt(match[1] || '1', 10) : null;
      })
      .filter(num => num !== null) as number[];

    const nextNumber = copyNumbers.length > 0 ? Math.max(...copyNumbers) + 1 : 1;
    return `${baseName} (cópia${nextNumber > 1 ? ' ' + nextNumber : ''})`;
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  openCategoryDialog(category?: iCategory | undefined, subcategory?: iSubcategory | void): void {
    const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
      width: '400px',
      data: { category, subcategory }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
     if (result) await this.initializeData();
    });
  }

  public openProductDialog(food?: IFoodAdmin): void {
    const dialogRef = this.dialog.open(AddEditItemDialogComponent, {
      width: '400px',
      height: '739px',
      data: { foodId: food?.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if (result) this.updateItemList(result);
    });
  }

  // private updateItemList(newFood: IFoodAdmin): void {
  //   this.items.update((currentItems) => {
  //     const updated = this.formatFood(newFood);
  //     const index = currentItems.findIndex(item => item.id === newFood.id);

  //     const newList = index !== -1
  //       ? currentItems.map(item => (item.id === newFood.id ? updated : item))
  //       : [updated, ...currentItems];

  //     this.hasMoreData.set(newList.length >= this.pageSize);

  //     return newList;
  //   });
  // }

  // private async removeFood(food: IFoodAdmin, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
  //   try {
  //     this.loadingService.showLoading();

  //     const imagePath = food.image_url?.replace(/^.*\/food-images\//, 'food-images/');
  //     const deletedImage = imagePath ? await this.imageService.deleteImage(imagePath) : true;
  //     if(food.id !== undefined) {
  //       const error = await this.foodService.delete(food.id);

  //       if (!error && deletedImage) {
  //         this.toast.success('Item deletado com sucesso!');
  //         this.deleteItemFromList(food.id);
  //         dialogRef.close(true);
  //       }
  //     }
  //   } finally {
  //     this.loadingService.hideLoading();
  //   }
  // }

  // private deleteItemFromList(id: string): void {
  //   this.items.update(currentItems => {
  //     const updated = currentItems.filter(item => item.id !== id);
  //     this.hasMoreData.set(updated.length >= this.pageSize);
  //     return updated;
  //   });
  // }
}

