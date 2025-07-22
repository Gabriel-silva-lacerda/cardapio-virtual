import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { FoodApi } from '@shared/api/food/food.api';
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
import { CategoryExtraService } from '@shared/services/extra/category-extra.service';
import { sanitizeFileName } from '@shared/utils/file-name/file-name.util';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { ToastService } from '@shared/services/toast/toast.service';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';

// Adiciona o campo na interface local para evitar erro de compilação
interface IFoodAdminWithTime extends IFoodAdmin {
  available_time?: string | null;
  available_days?: any;
}

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
export class AddEditItemDialogComponent implements AfterViewInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private localStorageService = inject(LocalStorageService);
  private foodApi = inject(FoodApi);
  private imageService = inject(ImageService);
  private toast = inject(ToastService);
  private subcategoryService = inject(SubcategoryService);
  private categoryService = inject(CategoryService)
  private categoryExtraService = inject(CategoryExtraService);
  private currentExtras: string[] = [];
  private currentSubcategoryId: string = '';
  private dialog = inject(MatDialog);

  public dialogRef = inject(MatDialogRef<AddEditItemDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as {
    food?: IFoodAdmin;
    category?: iCategory;
    subcategory?: iSubcategory;
  };
  public loadingService = inject(LoadingService);
  public destroy$ = new Subject<void>();
  public imageUrl: string | null = null;
  public companyId = this.localStorageService.getSignal('companyId', '0');

  public loading = signal({
    categories: false,
    default: false,
  });

  checked: boolean = false;

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
      name: 'has_available_time',
      label: 'Este produto tem horário específico?',
      type: 'checkbox',
      padding: '10px',
      defaultValue: false,
      onChange: (data: unknown, form: FormGroup) => {
        const event = data as Event;
        const target = event.target as HTMLInputElement;
        this.checked = target.checked;
        this.onHasAvailableTimeChange(target.checked, form);
      }
    },
    {
      name: 'available_time',
      label: 'Horário disponível',
      type: 'time-interval',
      validators: this.checked ? [Validators.required, this.timeIntervalValidator] : [],
      padding: '10px',
      visibleIf: (form: FormGroup) => !!form.get('has_available_time')?.value
    },
    {
      name: 'available_day_start',
      label: 'Dia inicial',
      type: 'select',
        group: 'available_days',

      options: [
        { label: 'Segunda', value: 'Mon' },
        { label: 'Terça', value: 'Tue' },
        { label: 'Quarta', value: 'Wed' },
        { label: 'Quinta', value: 'Thu' },
        { label: 'Sexta', value: 'Fri' },
        { label: 'Sábado', value: 'Sat' },
        { label: 'Domingo', value: 'Sun' }
      ],
      validators: this.checked ? [Validators.required] : [],
      padding: '10px',
      visibleIf: (form: FormGroup) => !!form.get('has_available_time')?.value
    },
    {
      name: 'available_day_end',
      label: '',
      group: 'available_days',
      type: 'select',
      options: [
        { label: 'Segunda', value: 'Mon' },
        { label: 'Terça', value: 'Tue' },
        { label: 'Quarta', value: 'Wed' },
        { label: 'Quinta', value: 'Thu' },
        { label: 'Sexta', value: 'Fri' },
        { label: 'Sábado', value: 'Sat' },
        { label: 'Domingo', value: 'Sun' }
      ],
      validators: this.checked ? [Validators.required] : [],
      padding: '10px',
      visibleIf: (form: FormGroup) => !!form.get('has_available_time')?.value
    },
    {
      name: 'category_id',
      label: 'Categoria',
      type: 'select',
      validators: [Validators.required],
      padding: '10px',
      onChange: async (data: unknown, form: FormGroup) => this.onCategoryChange(data, form),
    },
    {
      name: 'subcategory_id',
      label: 'Subcategoria',
      type: 'select',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'image_url',
      label: 'Imagem',
      type: 'file',
      padding: '10px',
      onFileUpload: async (file, form) => form.patchValue({ image_url: file })
    },
  ];

  // Validação customizada para garantir que o horário final seja maior que o inicial
  timeIntervalValidator(control: AbstractControl): any {
    const value = control.value;
    if (!value) return null;
    const [start, end] = value.split('-');
    if (!start || !end) return { invalidTime: 'Horário inválido.' };
    // Converte para minutos
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) {
      return { invalidTimeOrder: 'O horário final deve ser maior que o inicial.' };
    }
    return null;
  }

  private onHasAvailableTimeChange(checked: boolean = false, form: FormGroup) {
    const availableTimeControl = form.get('available_time');
    if (checked) {
      availableTimeControl?.setValidators([
        Validators.required,
        this.timeIntervalValidator
      ]);

    } else {
      availableTimeControl?.clearValidators();
      availableTimeControl?.setValue(null);
    }

    availableTimeControl?.updateValueAndValidity();
  }

  async ngAfterViewInit() {
    this.initializeForm();

    this.dynamicForm.form.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
    });
  }

  private async initializeForm() {
    if (this.data.food) {
      await this.getFoodDataById(this.data.food);
    } else {
      this.populateFormFromFoodData();
    }
  }

  private populateFormFromFoodData(): void {
    const category = this.data.category;
    const subcategory = this.data.subcategory;

    this.setFoodFieldOptions('category_id', [category as any]);
    this.setFoodFieldOptions('subcategory_id', [subcategory as any]);

    this.dynamicForm.form.patchValue({
      category_id: category?.id,
    });

    setTimeout(() => {
      this.dynamicForm.form.patchValue({
        subcategory_id: subcategory?.id,
      });
      this.dynamicForm.disableFields(['category_id', 'subcategory_id']);
    }, 100);
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

  private async getFoodDataById(food: any) {
    this.setLoading('default', true);
    try {
      // Supondo que seu foodApi tenha método para consultar views
      const foodData = food;
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

  private populateForm(foodData: IFoodAdminWithTime, extrasId: string[]): void {
    this.dynamicForm.form.patchValue({
      ...foodData,
      category_id: foodData.category_id,
      extras: extrasId,
      has_available_time: !!foodData.available_time,
      available_time: foodData.available_time || '',
    });
    if (!!foodData.available_time) {
      this.onHasAvailableTimeChange(true, this.dynamicForm.form);
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

    this.setLoading('default', true);
    try {
      const formData = this.dynamicForm.form.getRawValue();
      const imageUrl = await this.handleImageUpload(formData);
      const data = this.buildFoodPayload(formData, imageUrl);

      let foods;

      if (this.data.food) {
        foods = await this.foodApi.updateFoodWithExtras(this.data.food.id, data);
        this.toast.success('Item atualizado com sucesso!');
      } else {
        console.log('Creating new food with data:', data);
        foods = await this.foodApi.createFoodWithExtras(data);
        this.toast.success('Item criado com sucesso!');
      }

      this.dialogRef.close(foods);
    } catch {
      this.dialogRef.close(false);
    } finally {
      this.setLoading('default', true);
    }
  }

  private buildFoodPayload(formData: any, imageUrl: string | null = null): iFood {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let available_days: string[] = [];
    if (formData.has_available_time && formData.available_day_start && formData.available_day_end) {
      const startIdx = weekDays.indexOf(formData.available_day_start);
      const endIdx = weekDays.indexOf(formData.available_day_end);
      if (startIdx !== -1 && endIdx !== -1) {
        if (startIdx <= endIdx) {
          available_days = weekDays.slice(startIdx, endIdx + 1);
        } else {
          available_days = [...weekDays.slice(startIdx), ...weekDays.slice(0, endIdx + 1)];
        }
      }
    }
    const payload: any = {
      ...formData,
      image_url: imageUrl || 'food-images/default-food.png',
      company_id: this.companyId(),
      available_days,
    };
    // Remove campos individuais do payload
    delete payload.available_day_start;
    delete payload.available_day_end;
    delete payload.has_available_time;
    if (!formData.has_available_time) {
      payload.available_time = null;
      payload.available_days = [];
    }
    return payload;
  }

  private async handleImageUpload(formData: any): Promise<string | null> {
    const file = formData.image_url;
    if (!(file instanceof File)) return formData.image_url;

    if (this.data.food && this.imageUrl) {
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
        this.dynamicForm.isDisabled['subcategory_id'] = false;

        this.setFoodFieldOptions('extras', extras);
        this.setFoodFieldOptions('subcategory_id', subcategories);
        this.dynamicForm.enableFields(['extras', 'subcategory_id']);

        this.restorePreviousValuesIfSameCategory(form, categoryId);
      } finally {
        this.setLoading('default', false);
      }
    }

  // openCategoryDialog(category?: iCategory | undefined): void {
  //   const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
  //     width: '400px',
  //     data: category,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) this.getAllCategories();
  //   });
  // }


  // openSubcategoryDialog(subcategory?: iSubcategory | undefined): void {
  //   const categoryId = this.dynamicForm.form.get('category_id')?.value;
  //   const dialogRef = this.dialog.open(AddEditSubcategoryDialogComponent, {
  //     width: '400px',
  //     data: { subcategory, categoryId, showItem: true},
  //   });

  //   dialogRef.afterClosed().subscribe(async (result) => {
  //     if (result) this.getSubcategoriesByCategory(categoryId, result.id);
  //   });
  // }

  // async getSubcategoriesByCategory(categoryId: string, selectId?: string) {
  //   this.setLoading('default', true);
  //   try {
  //     const subcategories = await this.subcategoryService.getAllByField<{ id: string; name: string }>(
  //       'category_id',
  //       categoryId
  //     );

  //     this.setFoodFieldOptions('subcategory_id', subcategories);

  //     if (selectId) {
  //       this.dynamicForm.form.get('subcategory_id')?.setValue(selectId);
  //     }

  //     return subcategories;
  //   } finally {
  //     this.setLoading('default', false);
  //   }
  // }
}

  // private openSubcategoryDialog(): MatDialogRef<SubcategoryDialogComponent> {
  //   return this.dialog.open(SubcategoryDialogComponent, {
  //     width: '400px',
  //     data: this.categories,
  //   });
  // }



