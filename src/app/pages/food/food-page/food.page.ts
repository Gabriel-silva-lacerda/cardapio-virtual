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
import { KeyValuePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddEditItemDialogComponent } from '../components/add-edit-item-dialog/add-edit-item-dialog.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ImageService } from '@shared/services/image/image.service';
import { ToastrService } from 'ngx-toastr';
import { iFoodDetails } from '@shared/interfaces/food-details/food-datails.interface';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { SkeletonFoodComponent } from '../components/skeleton-food/skeleton-food.component';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@shared/services/company/company.service';
import { Company } from '@shared/interfaces/company/company';
import { AddFeeDialogComponent } from '../components/add-fee-dialog/add-fee-dialog.component';

interface SubcategoryGroup {
  id: string;
  name: string;
  foods: iFood[];
}

interface CategoryGroup {
  id: string;
  name: string;
  subcategories: Record<string, SubcategoryGroup>;
}

@Component({
  selector: 'app-food-page',
  imports: [
    FoodMenuComponent,
    HeaderPageComponent,
    KeyValuePipe,
    SkeletonLoaderComponent,
    SkeletonFoodComponent,
    FormsModule,
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
  public groupedFoods = signal<Record<string, CategoryGroup>>({});
  public groupedSubFoods = signal<Record<string, iFood[]>>({});
  public loadingService = inject(LoadingService);
  public skeletonItems = Array.from({ length: 5 });
  public isAdmin = this.authService.isAdmin;
  public companyId = this.localStorageService.getSignal('companyId', '0');
  public company = signal<Company>({} as Company);
  public subCategories = signal<any[]>([]);

  ngOnInit(): void {
    this.getAllFoods();
    this.getCompanyId();
  }

  private async getAllFoods(): Promise<void> {
    this.loadingService.showLoading();

    try {
      this.id = await firstValueFrom(this.route.paramMap).then((params) =>
        params.get('id')
      );

      if (this.id) {
        this.getFoodsByCategory(this.id, this.companyId());
      } else {
        const groupedFoods =
          await this.foodService.getAllFoodsGroupedByCategory(this.companyId());
        this.groupedFoods.set(groupedFoods);
        this.title.set('Cardápio');
      }
    } finally {
      this.loadingService.hideLoading();
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

  public async getFoodsByCategory(
    id: string,
    companyId: string
  ): Promise<void> {
    const groupedSubFoods = await this.foodService.getFoodsByCategory(
      id,
      companyId
    );

    if (groupedSubFoods) {
      this.groupedSubFoods.set(groupedSubFoods);
      const category = await this.categoryService.getById<iCategory>(
        'categories',
        id
      );
      if (category) {
        this.category.set(category);
        this.title.set(category.name);
      }
    }
  }

  async getSubcategoriesByCategoryId(categoryId: string): Promise<void> {
    try {
      const subcategories = await this.categoryService.getAllByField<any>(
        'subcategories',
        'category_id',
        categoryId
      );
      this.subCategories.set(subcategories);
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
      this.subCategories.set([]);
    }
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
        loading: this.loadingService.loading(),
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        if (food.imageUrl && food.id) {
          const imageUrl = food.imageUrl.replace(
            /^.*\/food-images\//,
            'food-images/'
          );

          const deleted = await this.imageService.deleteImage(imageUrl);
          const error = await this.foodService.delete('foods', food.id);

          if (!error && deleted) {
            this.toastr.success('Item deletado com sucesso!');
            this.getAllFoods();
            this.loadingService.hideLoading();
          }
        }
      }
    });

    this.loadingService.hideLoading();
  }

  public openDialogFee() {
    const dialogRef = this.dialog.open(AddFeeDialogComponent, {
      width: '400px',
      data: this.company(),
    });
  }
}
