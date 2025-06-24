import {
  Component,
  inject,
  Inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { CompanyService } from '@shared/services/company/company.service';
import { FoodService } from '@shared/services/food/food.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ImageService } from '@shared/services/image/image.service';
import { iCategory } from '../../../home/interfaces/category.interface';
import { CategoryService } from '../../../home/services/category.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '@shared/services/loading/loading.service';
import { Subject } from 'rxjs';
import { WEEK_DAYS_OPTIONS } from '../../constants/week-days-options';
import { ButtonComponent } from '@shared/components/button/button.component';
import { AddExtraDialogComponent } from '../add-extra-dialog/add-extra-dialog.component';
import { iFood } from '@shared/interfaces/food/food.interface';
import { ExtraService } from '@shared/services/extra/extra.service';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { SubcategoryDialogComponent } from '../../../categories/components/subcategory-dialog/subcategory-dialog.component';
import { SubcategoryService } from '../../../home/services/subcategory.service';
import { CompanyCategoryViewService } from '@shared/services/company/company-category-view.service';
import { CategoryExtraService } from '@shared/services/extra/category-extra.service';

@Component({
  selector: 'app-add-edit-item-dialog',
  imports: [
    DynamicFormComponent,
    ButtonComponent,
    GenericDialogComponent,
    LoadingScreenComponent,
  ],
  templateUrl: './add-edit-item-dialog.component.html',
  styleUrl: './add-edit-item-dialog.component.scss',
})
export class AddEditItemDialogComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private localStorageService = inject(LocalStorageService);
  private extraService = inject(ExtraService);
  private foodService = inject(FoodService);
  private imageService = inject(ImageService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);
  private subcategoryService = inject(SubcategoryService);
  private companyCategoryViewService = inject(CompanyCategoryViewService)
  private categoryExtraService = inject(CategoryExtraService);

  public dialogRef = inject(MatDialogRef<AddEditItemDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as { foodId: number };
  public loadingService = inject(LoadingService);
  public destroy$ = new Subject<void>();
  public categories = signal<{ id: string; name: string }[]>([]);
  public extras = signal<{ id: string; name: string }[]>([]);
  public imageUrl: string | null = null;
  public companyId = this.localStorageService.getSignal('companyId', '0');
  public subcategories = signal<{ id: string; name: string }[]>([]);

  public loading = signal({
    categories: false,
    subcategories: false,
    extras: false,
  });

  public foodFields: iDynamicField[] = [
    {
      name: 'name',
      label: 'Nome do Item',
      type: 'text',
      // validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'text',
      validators: [],
      padding: '10px',
    },
    {
      name: 'price',
      label: 'Preço',
      type: 'text',
      // validators: [Validators.required],
      padding: '10px',
      directive: 'onlyNumbers',
    },
    {
      name: 'category_id',
      label: 'Categoria',
      type: 'select',
      // validators: [Validators.required],
      padding: '10px',
        onChange: (data: unknown, form: FormGroup) => {
          const categoryId = String(data);
          this.getSubcategoriesByCategory(categoryId);
        },
    },
        {
      name: 'extras',
      label: 'Adicionais',
      type: 'multiselect',
      validators: [],
      padding: '10px',
      tooltip: 'Selecione uma categoria primeiro!',
    },
    {
      name: 'subcategory_id',
      label: 'Subcategoria',
      type: 'select',
      // validators: [Validators.required],
      padding: '10px',
    },
    // {
    //   name: 'has_day_of_week',
    //   label: 'Esse item pode ter todos os dias da semana?',
    //   type: 'select',
    //   options: [
    //     { label: 'Sim', value: true },
    //     { label: 'Não', value: false },
    //   ],
    //   validators: [Validators.required],
    //   padding: '10px',
    //   onChange: (data: string | unknown, form: FormGroup) => {
    //     if (data === 'true') {
    //       this.removeDayOfWeekField(form);
    //     } else {
    //       this.addDayOfWeekField(form);
    //     }
    //   },
    // },
    {
      name: 'image_url',
      label: 'Imagem',
      type: 'file',
      padding: '10px',
      onFileUpload: async (file, form) => form.patchValue({ image_url: file })
    },
  ];

  async ngOnInit() {
    this.data.foodId ? this.getFoodDataById(this.data.foodId) : this.getAllCategoriesAndExtras();
  }

  private async getAllCategoriesAndExtras() {
    await Promise.all([this.getAllCategories()]);
  }

  private async getAllCategories() {
    this.setLoading('categories', true);
    try {
      const result = await this.companyCategoryViewService.getAllByField<iCategory>('company_id', this.companyId());
      this.categories.set(result);
      this.setFoodFieldOptions('category_id', result);
      this.dynamicForm.isDisabled['extras'] = true;
      this.dynamicForm.isDisabled['subcategory_id'] = true;
    } finally {
      this.setLoading('categories', false);
    }
  }

  private async getAllExtras(categoryId: any) {
    this.setLoading('extras', true);
    try {
      const extras = await this.categoryExtraService.getExtrasByCategoryId(categoryId);
      this.extras.set(extras);
      this.setFoodFieldOptions('extras', extras);
    } finally {
      this.setLoading('extras', false);
    }
  }

  private setFoodFieldOptions(fieldName: string, items: { id: string; name: string }[]) {
    const field = this.foodFields.find(f => f.name === fieldName);
    if (field) {
      field.options = items.map(item => ({ label: item.name, value: item.id }));
    }
  }

  private async getSubcategoriesByCategory(categoryId: string) {
    this.setLoading('subcategories', true);
    try {
      const result = await this.subcategoryService.getAllByField<{ id: string; name: string }>('category_id', categoryId);
      this.setFoodFieldOptions('subcategory_id', result);
      this.getAllExtras(categoryId);
      this.dynamicForm.isDisabled['extras'] = false;
      this.dynamicForm.isDisabled['subcategory_id'] = false;
    } finally {
      this.setLoading('subcategories', false);
    }
  }

  private async getFoodDataById(foodId: number) {
    this.loadingService.showLoading();
    try {
      const foodData = await this.foodService.getById<iFood>(foodId.toString());
      this.imageUrl = foodData?.image_url || null;

      this.getAllCategories();

      if (foodData) {
        const extras = await this.extraService.getExtrasByFoodId(foodId.toString());

        if (foodData.image_url) {
          this.dynamicForm.selectedFileName = foodData.image_url;
          this.dynamicForm.imagePreviewUrl = await this.imageService.getImageUrl(foodData.image_url);
        }

        this.dynamicForm.form.patchValue({
          ...foodData,
            category_id: foodData.category_id,

          extras: extras.map(extra => extra.id),
          has_day_of_week: foodData.day_of_week !== null,
          day_of_week: foodData.day_of_week || null,
        });
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public async onSave(): Promise<void> {
    if (this.dynamicForm.form.invalid) return;

    this.loadingService.showLoading();
    try {
      const formData = this.dynamicForm.form.value;
      const imageUrl = await this.handleImageUpload(formData);

      const { extras = [], ...foodData } = {
        ...formData,
        image_url: imageUrl || 'food-images/default-food.png',
        company_id: this.companyId(),
        day_of_week: formData.day_of_week || null,
      };

      const extraIds = extras;
      let foods;
      if (this.data.foodId) {
        foods = await this.foodService.updateFoodWithExtras(this.data.foodId, foodData, extraIds);
        this.toastr.success('Item atualizado com sucesso!');
      } else {
        foods = await this.foodService.createFoodWithExtras(foodData, extraIds);
        this.toastr.success('Item criado com sucesso!');
      }

      this.dialogRef.close(foods);
    } catch {
      this.dialogRef.close(false);
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private async handleImageUpload(formData: any): Promise<string | null> {
    const file = formData.image_url;
    if (!(file instanceof File)) return formData.image_url;

    if (this.data.foodId && this.imageUrl) {
      await this.imageService.deleteImage(this.imageUrl);
    }

    const sanitized = this.sanitizeFileName(file.name);
    return this.imageService.uploadImage(file, `food-images/${sanitized}`);
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .toLowerCase();
  }

  private setLoading(key: string, value: boolean): void {
    this.loading.set({ ...this.loading(), [key]: value });
  }



  private openSubcategoryDialog(): MatDialogRef<SubcategoryDialogComponent> {
    return this.dialog.open(SubcategoryDialogComponent, {
      width: '400px',
      data: this.categories,
    });
  }

  private addDayOfWeekField(form: FormGroup): void {
    if (!form.contains('day_of_week') && form.get('has_day_of_week')?.value) {
      form.addControl('day_of_week', new FormControl('', Validators.required));

      const insertIndex = this.foodFields.findIndex(f => f.name === 'has_day_of_week') + 1;
      this.foodFields.splice(insertIndex, 0, {
        name: 'day_of_week',
        label: 'Dia da Semana',
        type: 'select',
        options: WEEK_DAYS_OPTIONS,
        validators: [Validators.required],
        padding: '10px',
      });
    }
  }

   private removeDayOfWeekField(form: FormGroup): void {
    if (form.contains('day_of_week')) {
      form.removeControl('day_of_week');
      this.foodFields = this.foodFields.filter(f => f.name !== 'day_of_week');
    }
  }
}
