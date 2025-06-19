import { HeaderClientComponent } from '@core/layout/header-client/header-client.component';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade, fadeScale } from '@shared/utils/animations.utils';
import { iFood } from '@shared/interfaces/food/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';
import { KeyValuePipe, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddEditItemDialogComponent } from '../components/add-edit-item-dialog/add-edit-item-dialog.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ImageService } from '@shared/services/image/image.service';
import { ToastrService } from 'ngx-toastr';
import { iFoodDetails } from '@shared/interfaces/food-details/food-datails.interface';
import { LoadingService } from '@shared/services/loading/loading.service';
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
import { SkeletonSubcategoriesComponent } from '../components/skeleton-subcategories/skeleton-subcategories.component';
import { SubcategoryDialogComponent } from '../../categories/components/subcategory-dialog/subcategory-dialog.component';
import { AddExtraDialogComponent } from '../components/add-extra-dialog/add-extra-dialog.component';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';
import { SubcategoryService } from '../../home/services/subcategory.service';

@Component({
  selector: 'app-food-page',
  imports: [
    FoodMenuComponent,
    HeaderClientComponent,
    KeyValuePipe,
    SkeletonFoodComponent,
    FormsModule,
    SubcategoriesComponent,
    SubcategoryItemComponent,
    SkeletonSubcategoriesComponent,
    PageLayoutClientComponent
],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.scss',
  animations: [fade, fadeScale],
})
export class MenuPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private imageService = inject(ImageService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private companyService = inject(CompanyService);
  private subcategoryService = inject(SubcategoryService);

  public foods = signal<iFood[]>([]);
  public title = signal<string>('');
  public category = signal<iCategory>({} as iCategory);
  public id!: string | null;
  public foodsGroupedCategory = signal<Record<string, iCategoryGroup>>({});
  public foodsGroupedCategoryId = signal<iCategoryGroup>({} as iCategoryGroup);
  public loadingService = inject(LoadingService);
  public isAdmin = this.authService.isAdmin;
  public companyId = this.localStorageService.getSignal('companyId', '0');
  public company = signal<Company>({} as Company);
  public subcategories = signal<iSubcategory[]>([]);
  public activeSubcategory = signal<string | null>(null);
  public isOpen = signal<boolean>(false);
  public loading = signal(false);

  ngOnInit(): void {
    this.getAllFoods();
    this.getCompanyId();
  }

  private async getAllFoods(): Promise<void> {
    try {
      this.loading.set(true);

      this.id = await firstValueFrom(this.route.paramMap).then((params) =>
        params.get('id')
      );

      if (this.id) {
        await Promise.all([
          this.getSubcategoriesByCategoryId(this.id),
          this.getFoodsByCategory(this.id),
        ]);
      } else {
        const [, foodsGroupedCategory] = await Promise.all([
          this.getSubCategories(),
          this.foodService.getAllFoodsGroupedByCategory(this.companyId()),
        ]);

        this.foodsGroupedCategory.set(foodsGroupedCategory);
        this.title.set('Cardápio');
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async getCompanyId(): Promise<void> {
    const company = await this.companyService.getById<Company>(
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
      await this.subcategoryService.getAllByField<iSubcategory>(
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
        onConfirm: async () => {
          try {
            this.loadingService.showLoading();

            if (food.imageUrl && food.id) {
              const imageUrl = food.imageUrl.replace(
                /^.*\/food-images\//,
                'food-images/'
              );

              const deleted = await this.imageService.deleteImage(imageUrl);
              const error = await this.foodService.delete(food.id);

              if (!error && deleted) {
                this.toastr.success('Item deletado com sucesso!');
                this.getAllFoods();
                dialogRef.close(true);
              }
            }
          } finally {
            this.loadingService.hideLoading();
          }
        },
      },
    });
  }

  public openDialogFee() {
    const dialogRef = this.dialog.open(AddFeeDialogComponent, {
      width: '400px',
      data: this.company(),
    });
  }

  public openDialogSubcategories(){
    const dialogRef = this.dialog.open(SubcategoryDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(async (categoryId) => {
      if (categoryId) {

      }
    });
  }

   public openDialogExtra() {
     const dialogRef = this.dialog.open(AddExtraDialogComponent, {
       width: '400px',
       data: true
    });

     dialogRef.afterClosed().subscribe((result) => {
       if (result) {
        //  this.loadExtrasBySubCategory(
        //    this.dynamicForm.form.value.subcategory_id
        //  );
       }
     });
   }

   public openDialogManageExtra() {

   }
}
