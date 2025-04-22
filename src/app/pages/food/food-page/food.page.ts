import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.utils';
import { iFood } from '@shared/interfaces/food/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';
import { KeyValuePipe, NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddEditItemDialogComponent } from '../components/add-edit-item-dialog/add-edit-item-dialog.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ImageService } from '@shared/services/image/image.service';
import { ToastrService } from 'ngx-toastr';
import { iFoodDetails } from '@shared/interfaces/food-details/food-datails.interface';
import { LoadingService } from '@shared/services/loading/loading.service';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { SkeletonFoodComponent } from '../components/skeleton-food/skeleton-food.component';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@shared/services/company/company.service';
import { Company } from '@shared/interfaces/company/company';
import { AddFeeDialogComponent } from '../components/add-fee-dialog/add-fee-dialog.component';
import { iCategoryGroup } from '@shared/interfaces/group/group-food.interface';
import { SubcategoriesComponent } from '@shared/components/subcategories/subcategories.component';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
import { SubcategoryItemComponent } from '@shared/components/subcategory-item/subcategory-item.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'app-food-page',
  imports: [
    FoodMenuComponent,
    HeaderPageComponent,
    KeyValuePipe,
    SkeletonLoaderComponent,
    SkeletonFoodComponent,
    FormsModule,
    SubcategoriesComponent,
    SubcategoryItemComponent,
    LoadingComponent,
  ],
  templateUrl: './food.page.html',
  styleUrl: './food.page.scss',
  animations: [fade],
})
export class FoodPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private imageService = inject(ImageService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private companyService = inject(CompanyService);

  public foods = signal<iFood[]>([]);
  public title = signal<string>('');
  public category = signal<iCategory>({} as iCategory);
  public id!: string | null;
  public foodsGroupedCategory = signal<Record<string, iCategoryGroup>>({});
  public foodsGroupedCategoryId = signal<iCategoryGroup>({} as iCategoryGroup);
  public loadingService = inject(LoadingService);
  public skeletonItems = Array.from({ length: 5 });
  public isAdmin = this.authService.isAdmin;
  public companyId = this.localStorageService.getSignal('companyId', '0');
  public company = signal<Company>({} as Company);
  public subcategories = signal<iSubcategory[]>([]);
  public activeSubcategory = signal<string | null>(null);

  public loading = signal({
    foodAndSubcategory: false,
    subcategory: false,
  });

  ngOnInit(): void {
    this.getAllFoods();
    this.getCompanyId();
  }

  private async getAllFoods(): Promise<void> {
    try {
      this.loading.update((state) => ({
        ...state,
        foodAndSubcategory: true,
      }));

      this.id = await firstValueFrom(this.route.paramMap).then((params) =>
        params.get('id')
      );

      if (this.id) {
        this.getSubcategoriesByCategoryId(this.id);
        this.getFoodsByCategory(this.id);
      } else {
        this.getSubCategories();
        const foodsGroupedCategory =
          await this.foodService.getAllFoodsGroupedByCategory(this.companyId());
        this.foodsGroupedCategory.set(foodsGroupedCategory);
        this.title.set('Cardápio');
      }
    } finally {
      this.loading.update((state) => ({
        ...state,
        foodAndSubcategory: false,
      }));
    }
  }

  private async getCompanyId(): Promise<void> {
    const company = await this.companyService.getById<Company>(
      'companies',
      this.companyId()
    );
    if (company) {
      this.company.set(company);
    }
  }

  public async getFoodsByCategory(id: string): Promise<void> {
    const foodsGroupedCategoryId =
      await this.foodService.getFoodsGroupedByCategoryId(id);

    if (foodsGroupedCategoryId) {
      this.foodsGroupedCategoryId.set(foodsGroupedCategoryId);
      this.title.set(foodsGroupedCategoryId.name);
    }
  }

  private async getSubCategories() {
    this.subcategories.set(
      (await this.categoryService.getSubcategories()) as iSubcategory[]
    );
  }

  async getSubcategoriesByCategoryId(categoryId: string): Promise<void> {
    const subcategories =
      await this.categoryService.getAllByField<iSubcategory>(
        'subcategories',
        'category_id',
        categoryId
      );
    this.subcategories.set(subcategories);
  }

  public openDialogFood(foodId?: string) {
    const dialogRef = this.dialog.open(AddEditItemDialogComponent, {
      width: '400px',
      height: '739px',
      data: {
        foodId,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.getAllFoods();
      }
    });
  }

  public openDialogRemoveFood(food: iFoodDetails) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Excluir Item',
        message: 'Tem certeza que deseja excluir este item?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        loading: this.loading().subcategory,
        onConfirm: async () => {
          this.loading.update((state) => ({ ...state, subcategory: true }));

          if (food.imageUrl && food.id) {
            const imageUrl = food.imageUrl.replace(
              /^.*\/food-images\//,
              'food-images/'
            );

            const deleted = await this.imageService.deleteImage(imageUrl);
            const error = await this.foodService.delete('foods', food.id);

            this.loading.update((state) => ({ ...state, subcategory: false }));

            if (!error && deleted) {
              this.toastr.success('Item deletado com sucesso!');
              this.loading.update((state) => ({
                ...state,
                subcategory: false,
              }));

              this.getAllFoods();
            }

            dialogRef.close(true); // <-- só fecha depois que tudo terminar
          }
        },
      },
    });

    // dialogRef.afterClosed().subscribe(async (result) => {
    //   if (result) {
    //     if (food.imageUrl && food.id) {
    //       const imageUrl = food.imageUrl.replace(
    //         /^.*\/food-images\//,
    //         'food-images/'
    //       );

    //       const deleted = await this.imageService.deleteImage(imageUrl);
    //       const error = await this.foodService.delete('foods', food.id);
    //       this.loading.update((state) => ({
    //         ...state,
    //         subcategory: false,
    //       }));

    //       if (!error && deleted) {
    //         this.toastr.success('Item deletado com sucesso!');
    //         this.getAllFoods();
    //         this.loadingService.hideLoading();
    //       }
    //     }
    //   }
    // });
  }

  public openDialogFee() {
    const dialogRef = this.dialog.open(AddFeeDialogComponent, {
      width: '400px',
      data: this.company(),
    });
  }
}
