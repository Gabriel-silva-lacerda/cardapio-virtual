import { Component, computed, inject, Signal, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

// Components
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { PageLayoutAdminComponent } from '@shared/components/page-layout-admin/page-layout-admin.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { AddEditItemDialogComponent } from '../components/add-edit-item-dialog/add-edit-item-dialog.component';
import { AddEditCategoryDialogComponent } from '../../register-category/components/add-edit-category-dialog/add-edit-category-dialog.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';

// Interfaces
import { IFoodAdmin } from '@shared/interfaces/food/food.interface';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';

// Services
import { FoodApi } from '@shared/api/food/food.api';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';
import { CompanyService } from '@shared/services/company/company.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { ImageService } from '@shared/services/image/image.service';
import { DuplicationService } from '../shared/service/duplication.service';

// Utils
import { getImageUrl } from '@shared/utils/get-image/get-image.utits';
import { fadeScale } from '@shared/utils/animations.util';
import { openConfirmDialog } from '@shared/utils/dialog/dialog.util';
import { getBaseName, getNextCopyName } from '../shared/utils/base-name-util';

// Pipes
import { FilterByFieldPipe } from "../../../../widget/pipes/filter-by-field.pipe";
import { eCategoryLevel } from '../shared/enums/category-level.enum';
import { eCategoryFilterKey } from '../shared/enums/category-filter-key.enum';
import { FoodListComponent } from '../components/food-list/food-list.component';
import { CategoryHeaderComponent } from '../components/category-header/category-header.component';
import { FoodCardComponent } from '../components/food-card/food-card.component';

@Component({
  selector: 'app-register-product-page',
  imports: [PageLayoutAdminComponent, FormsModule, CommonModule, SearchInputComponent, LoadingComponent, FilterByFieldPipe, CategoryHeaderComponent, FoodCardComponent],
  templateUrl: './register-product-page.html',
  styleUrl: './register-product-page.scss',
  animations: [fadeScale],

})
export class RegisterProductPage {
  private foodApi = inject(FoodApi);
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private toast = inject(ToastService);
  private categoryService = inject(CategoryService);
  private companyService = inject(CompanyService);
  private subcategoryService = inject(SubcategoryService);
  private duplicationService = inject(DuplicationService);

  // Signals
  public isOpen = signal(false);
  public loading = signal(false);
  public selectedCategoryId = signal<string | null>(null);
  public selectedSubcategoryId = signal<string | null>(null);
  public categories = signal<iCategory[]>([]);
  public subcategories = signal<iSubcategory[]>([]);
  public expandedSubcategories = signal<Record<string, boolean>>({});
  public expandedCategories = signal<Record<string, boolean>>({});
  public foodsByContainer = signal<any>({});
  public loadingFoodsByContainer = signal<any>({});
  public foodCountByContainer = signal<any>({});
  public eCategoryLevel = eCategoryLevel;

  private destroy$ = new Subject<void>();
   searchSubject = new Subject<{ id: string; query: string; type: eCategoryLevel }>();

  async ngOnInit() {
    await this.initializeData();
    this.listenSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    const categories = await this.categoryService.getAllByField<iCategory>('company_id', this.companyService.companyId(), '*', {
      orderBy: 'created_at',
      ascending: false,
    });
    this.categories.set(categories);
  }

  private async getSubcategories(): Promise<void> {
    const subcategories = await this.subcategoryService.getAllByField<iSubcategory>('company_id', this.companyService.companyId());
    this.subcategories.set(subcategories);
  }

  private listenSearch(): void {
    this.searchSubject.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe(({ id, query, type }) => {
      if (query?.trim()) this.getFoods(id, query, type);
    });
  }

  async toggleContainer(id: string, type: eCategoryLevel): Promise<void> {
    const expandedSignal = type === eCategoryLevel.Category ? this.expandedCategories : this.expandedSubcategories;
    const isCurrentlyOpen = expandedSignal()[id];

    if (type === eCategoryLevel.Category) {
      this.expandedCategories.set({});
    } else {
      this.expandedSubcategories.set({});
    }

    if (!isCurrentlyOpen) {
      expandedSignal.update(state => ({ ...state, [id]: true }));

      if (!this.foodsByContainer()[id]) {
        await this.getFoods(id, '', type);
      }
    }
  }

  private async getFoods(id: string, query: string, type: eCategoryLevel): Promise<void> {
    this.loadingFoodsByContainer.update(state => ({ ...state, [id]: true }));
    try {
      const foods = await this.foodApi.getFoodsByContainer(this.companyService.companyId(), id, query, type);
      this.foodsByContainer.update(state => ({ ...state, [id]: foods }));
    } catch (error) {
      this.toast.error('Erro ao carregar alimentos.');
      console.error(error);
    } finally {
      this.loadingFoodsByContainer.update(state => ({ ...state, [id]: false }));
    }
  }

  onSearchChange(id: string, query: string, type: eCategoryLevel.Category | eCategoryLevel.Subcategory): void {
    this.searchSubject.next({ id, query, type });
  }

  public openDialogDuplicateCategory(category: iCategory): void {
    const signalSubcategories = computed(() =>this.subcategories().filter(s => s.category_id === category.id));
    const message = this.createDuplicateCategoryMessage(category, signalSubcategories());

    openConfirmDialog<{ category: iCategory; subcategories: Signal<iSubcategory[]> }>(this.dialog, {
      title: 'Duplicar categoria',
      message: message,
      confirmText: 'Duplicar',
      cancelText: 'Cancelar',
      payload: { category, subcategories: signalSubcategories },
      onConfirm: async (payload, dialogRef) => {
        if (payload) {
          await this.handleDuplicateCategory(payload, dialogRef);
        }
      },
    });
  }

  private async handleDuplicateCategory(
    payload: { category: iCategory; subcategories: Signal<iSubcategory[]> },
    dialogRef: MatDialogRef<ConfirmDialogComponent>
  ): Promise<void> {
    try {
      this.loadingService.showLoading();
      await this.duplicationService.duplicateCategoryAndSubcategories(
        payload.category,
        payload.subcategories(),
        this.companyService.companyId(),
        this.foodsByContainer()
      );

      this.toast.success('Categoria com subcategorias e produtos duplicados com sucesso!');
      this.initializeData();
      dialogRef.close();
    } finally  {
      this.loadingService.hideLoading();
    }
  }

  private createDuplicateCategoryMessage(category: iCategory, subcategories: iSubcategory[]): string {
    if (subcategories.length > 0) {
      const firstSubName = subcategories[0].name;
      return `Deseja duplicar a categoria "${category.name}" e suas subcategorias (ex: "${firstSubName}")?`;
    } else {
      return `Deseja duplicar a categoria "${category.name}" sem subcategorias?`;
    }
  }

  public openDialogConfirmRemoveFood(food: IFoodAdmin): void {
    openConfirmDialog<IFoodAdmin>(this.dialog, {
      title: 'Deletar Item',
      message: `Tem certeza que deseja deletar o item "${food.name}"? Esta ação é irreversível.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
      payload: food,
      onConfirm: async (payload, dialogRef) => {
        if (payload) {
          await this.removeFood(payload, dialogRef);
        }
      },
    });
  }

  openCategoryAndSubcategoryDialog(isEditCategory = false, category?: iCategory | undefined, subcategory?: iSubcategory): void {
    const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
      width: '400px',
      data: { isEditCategory, category, subcategory }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(async (result) => {
      if (result) await this.initializeData();
    });
  }

  public openProductDialog(category?: iCategory, subcategory?: iSubcategory | null, food?: any): void {
    const dialogRef = this.dialog.open(AddEditItemDialogComponent, {
      width: '400px',
      height: '739px',
      data: { category, subcategory, food },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => this.handleProductDialogClose(result));
  }

  private async handleProductDialogClose(result: IFoodAdmin | null | undefined): Promise<void> {
    if (result) {
      const containerId = result.subcategory_id || result.category_id;
      const containerLevel = result.subcategory_id ? eCategoryLevel.Subcategory : eCategoryLevel.Category;

      if (containerId) {
        await this.getFoods(containerId as string, '', containerLevel);
      }
    }
  }

  private async removeFood(food: IFoodAdmin, dialogRef: MatDialogRef<ConfirmDialogComponent>): Promise<void> {
    // try {
    //   this.loadingService.showLoading();

    //   const imagePath = food.image_url?.replace(/^.*\/food-images\//, 'food-images/');
    //   const deletedImage = imagePath ? await this.imageService.deleteImage(imagePath) : true;
    //   if(food.id !== undefined) {
    //     const error = await this.foodApi.delete(food.id);

    //     if (!error && deletedImage) {
    //       this.toast.success('Item deletado com sucesso!');
    //       this.deleteItemFromList(food.id);
    //       dialogRef.close(true);
    //     }
    //   }
    // } finally {
    //   this.loadingService.hideLoading();
    // }
  }

  // private deleteItemFromList(id: string): void {
  //   this.items.update(currentItems => {
  //     const updated = currentItems.filter(item => item.id !== id);
  //     this.hasMoreData.set(updated.length >= this.pageSize);
  //     return updated;
  //   });
  // }

  // Dentro da classe RegisterProductPage
}
