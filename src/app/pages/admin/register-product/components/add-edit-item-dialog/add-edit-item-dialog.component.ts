import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { FoodService } from '@shared/services/food/food.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ImageService } from '@shared/services/image/image.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { Subject } from 'rxjs';
import { WEEK_DAYS_OPTIONS } from '../../../../client/menu/constants/week-days-options';
import { ButtonComponent } from '@shared/components/button/button.component';
import { iFood, IFoodAdmin } from '@shared/interfaces/food/food.interface';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { SubcategoryService } from '../../../../client/home/services/subcategory.service';
import { CompanyCategoryViewService } from '@shared/services/company/company-category-view.service';
import { CategoryExtraService } from '@shared/services/extra/category-extra.service';
import { FoodAdminViewService } from '@shared/services/food/food-admin-view.service';
import { sanitizeFileName } from '@shared/utils/file-name/file-name.util';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { ToastService } from '@shared/services/toast/toast.service';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';

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
  private foodService = inject(FoodService);
  private imageService = inject(ImageService);
  private toast = inject(ToastService);
  private subcategoryService = inject(SubcategoryService);
  private categoryService = inject(CategoryService)
  private categoryExtraService = inject(CategoryExtraService);
  private currentExtras: string[] = [];
  private currentSubcategoryId: string = '';
  private foodAdminViewService = inject(FoodAdminViewService);

  public dialogRef = inject(MatDialogRef<AddEditItemDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as { foodId: number };
  public loadingService = inject(LoadingService);
  public destroy$ = new Subject<void>();
  public imageUrl: string | null = null;
  public companyId = this.localStorageService.getSignal('companyId', '0');

  public loading = signal({
    categories: false,
    default: false,
  });

  public foodFields: iDynamicField[] = [
    {
      name: 'name',
      label: 'Nome do Item',
      type: 'text',
      validators: [Validators.required],
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
      validators: [Validators.required],
      padding: '10px',
      directive: 'onlyNumbers',
    },
    {
      name: 'category_id',
      label: 'Categoria',
      type: 'select',
      validators: [Validators.required],
      padding: '10px',
      onChange: async (data: unknown, form: FormGroup) => this.onCategoryChange(data, form)
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
      validators: [Validators.required],
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
    this.initializeForm();
  }

  private async initializeForm() {
    if (this.data.foodId) {
      await this.getFoodDataById(this.data.foodId);
    } else {
      await this.getAllCategories();
    }
  }

  private async getAllCategories() {
    this.setLoading('categories', true);
    try {
      const categories = await this.categoryService.getAllByField<iCategory>('company_id', this.companyId());
      this.setFoodFieldOptions('category_id', categories);
      this.dynamicForm.disableFields(['extras', 'subcategory_id']);
    } finally {
      this.setLoading('categories', false);
    }
  }

  private setFoodFieldOptions(fieldName: string, items: { id: string; name: string }[]) {
    const field = this.foodFields.find(f => f.name === fieldName);
    if (field) {
      field.options = items.map(item => ({ label: item.name, value: item.id }));
    }
  }

  private resetDependentFields(form: FormGroup) {
    form.patchValue({
      extras: [],
      subcategory_id: ''
    });

    this.setFoodFieldOptions('extras', []);
    this.setFoodFieldOptions('subcategory_id', []);
  }

  private restorePreviousValuesIfSameCategory(form: FormGroup, selectedCategoryId: string) {
    const originalCategoryId = form.get('category_id')?.value;

    if (selectedCategoryId !== originalCategoryId) return;
    const extrasOptions = this.getOptionValues('extras');
    const subcategoryOptions = this.getOptionValues('subcategory_id');
    const hasValidExtras = this.currentExtras.every(id => extrasOptions.includes(id));
    const hasValidSubcategory = !this.currentSubcategoryId || subcategoryOptions.includes(this.currentSubcategoryId);

    if (hasValidExtras && hasValidSubcategory) {
      form.patchValue({
        extras: this.currentExtras,
        subcategory_id: this.currentSubcategoryId
      });
    }
  }

  private getOptionValues(fieldName: string): string[] {
    return (this.foodFields.find(f => f.name === fieldName)?.options ?? []).map(o => o.value as string);
  }

  private async getFoodDataById(foodId: number) {
    this.setLoading('default', true);
    try {
      // Supondo que seu foodService tenha método para consultar views
      const foodData = await this.foodAdminViewService.getByField<IFoodAdmin>('id', foodId.toString());
      if (!foodData) return;

      this.imageUrl = foodData.image_url || null;
      this.currentExtras = foodData.food_extra_ids ?? [];
      this.currentSubcategoryId = foodData.subcategory_id || '';

      // Atualiza as categorias da empresa direto da view
      // this.categories.set(foodData.company_categories ?? []);
      this.setFoodFieldOptions('category_id', foodData.company?.categories ?? []);

      // Atualiza extras da categoria direto da view
      this.setFoodFieldOptions('extras', foodData.extras ?? []);

      // Atualiza subcategorias da categoria direto da view
      // this.subcategories.set(foodData.subcategories ?? []);
      this.setFoodFieldOptions('subcategory_id', foodData.subcategories ?? []);

      this.dynamicForm.disableFields(['extras', 'subcategory_id']);

      if (foodData.image_url) {
        await this.updateImagePreview(foodData.image_url);
      }
      this.populateForm(foodData, foodData.food_extra_ids ?? [] );
    } finally {
      this.setLoading('default', false);
    }
  }

  private async updateImagePreview(imageUrl: string | null): Promise<void> {
    if (!imageUrl) return;

    this.dynamicForm.selectedFileName = imageUrl;
    this.dynamicForm.imagePreviewUrl = await this.imageService.getImageUrl(imageUrl);
  }

  private populateForm(foodData: IFoodAdmin, extrasId: string[]): void {
    this.dynamicForm.form.patchValue({
      ...foodData,
      category_id: foodData.category.id,
      extras: extrasId,
      has_day_of_week: foodData.day_of_week !== null,
      day_of_week: foodData.day_of_week || null,
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public async onSave(): Promise<void> {
    if (this.dynamicForm.form.invalid) return;

    this.setLoading('default', true);
    try {
      const formData = this.dynamicForm.form.value;
      const imageUrl = await this.handleImageUpload(formData);
      const data = this.buildFoodPayload(this.dynamicForm.form.value, imageUrl);
      const extraIds = data.extras;
      let foods;

      if (this.data.foodId) {
        foods = await this.foodService.updateFoodWithExtras(this.data.foodId, data.foodData, extraIds);
        this.toast.success('Item atualizado com sucesso!');
      } else {
        foods = await this.foodService.createFoodWithExtras(data.foodData, extraIds);
        this.toast.success('Item criado com sucesso!');
      }

      this.dialogRef.close(foods);
    } catch {
      this.dialogRef.close(false);
    } finally {
      this.setLoading('default', true);
    }
  }

  private buildFoodPayload(formData: any, imageUrl: string | null = null): { foodData: iFood; extras: string[] } {
    const { extras = [], ...foodData } = {
      ...formData,
      image_url: imageUrl || 'food-images/default-food.png',
      company_id: this.companyId(),
      day_of_week: formData.day_of_week || null,
    };
    return { foodData, extras };
  }

  private async handleImageUpload(formData: any): Promise<string | null> {
    const file = formData.image_url;
    if (!(file instanceof File)) return formData.image_url;

    if (this.data.foodId && this.imageUrl) {
      await this.imageService.deleteImage(this.imageUrl);
    }

    const sanitized = sanitizeFileName(file.name);
    return this.imageService.uploadImage(file, `food-images/${sanitized}`);
  }

  private setLoading(key: string, value: boolean): void {
    this.loading.set({ ...this.loading(), [key]: value });
  }

  private async onCategoryChange(data: unknown, form: FormGroup) {
    const categoryId = String(data);
    if(!categoryId) return;
      this.setLoading('default', true);
      this.resetDependentFields(form);
      this.dynamicForm.disableFields(['extras', 'subcategory_id']);

      try {
        const [extras, subcategories] = await Promise.all([
          this.categoryExtraService.getExtrasByCategoryId(categoryId),
          this.subcategoryService.getAllByField<{ id: string; name: string }>('category_id', categoryId)
        ]);

        this.setFoodFieldOptions('extras', extras);
        this.setFoodFieldOptions('subcategory_id', subcategories);
        this.dynamicForm.enableFields(['extras', 'subcategory_id']);
        this.restorePreviousValuesIfSameCategory(form, categoryId);
      } finally {
        this.setLoading('default', false);
      }
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

  // private openSubcategoryDialog(): MatDialogRef<SubcategoryDialogComponent> {
  //   return this.dialog.open(SubcategoryDialogComponent, {
  //     width: '400px',
  //     data: this.categories,
  //   });
  // }



