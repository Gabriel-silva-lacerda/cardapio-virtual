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

@Component({
  selector: 'app-add-edit-item-dialog',
  imports: [DynamicFormComponent, ButtonComponent],
  templateUrl: './add-edit-item-dialog.component.html',
  styleUrl: './add-edit-item-dialog.component.scss',
})
export class AddEditItemDialogComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private localStorageService = inject(LocalStorageService);
  private categoryService = inject(CategoryService);
  private extraService = inject(ExtraService);
  private foodService = inject(FoodService);
  private imageService = inject(ImageService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  public loadingService = inject(LoadingService);
  public destroy$ = new Subject<void>();
  public categories = signal<{ id: string; name: string }[]>([]);
  public extras = signal<{ id: string; name: string }[]>([]);
  public imageUrl: string | null = null;
  public companyId = this.localStorageService.getSignal('companyId', '0');

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
      options: this.categories().map((c) => ({ label: c.name, value: c.id })),
      validators: [Validators.required],
      padding: '10px',
      onChange: (data: unknown, form: FormGroup) => {
        const categoryId = String(data);

          this.loadExtrasByCategory(categoryId);

      },
    },
    {
      name: 'extras',
      label: 'Adicionais',
      type: 'multiselect',
      options: this.extras().map((e) => ({ label: e.name, value: e.id })),
      validators: [],
      padding: '10px',
      tooltip: 'Selecione uma categoria primeiro!',
      onClick: () => this.onAddExtraItem(),
    },
    {
      name: 'has_day_of_week',
      label: 'Esse item pode ter todos os dias da semana?',
      type: 'select',
      options: [
        { label: 'Sim', value: true },
        { label: 'Não', value: false },
      ],
      validators: [Validators.required],
      padding: '10px',
      onChange: (data: string | unknown, form: FormGroup) => {
        if (data === 'true') {
          this.removeDayOfWeekField(form);
        } else {
          this.addDayOfWeekField(form);
        }
      },
    },
    {
      name: 'image_file',
      label: 'Imagem',
      type: 'file',
      validators: [Validators.required],
      padding: '10px',
      onFileUpload: async (file, form) => {
        form.patchValue({ image_file: file });
      },
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<AddEditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { foodId: number }
  ) {}

  async ngOnInit() {
    this.getCategories();

    if (this.data.foodId) {
      this.loadFoodDataById(this.data.foodId);
    }
  }

  public async getCategories() {
    this.categories.set(await this.categoryService.getAllByField<iCategory>('company_categories_view', 'company_id', (this.companyId())),  );
    this.foodFields.find((f) => f.name === 'category_id')!.options =
    this.categories().map((c) => ({ label: c.name, value: c.id }));
    this.dynamicForm.isDisabled['extras'] = true;
    this.dynamicForm.showButton = true;
  }

  async loadFoodDataById(foodId: number): Promise<void> {
    try {
      this.loadingService.showLoading();

      const foodData = await this.foodService.getById<iFood>(
        'foods',
        foodId.toString()
      );
      this.imageUrl = foodData?.image_url || null;

      if (foodData) {
        const extras = await this.extraService.getExtrasByFoodId(
          foodId.toString()
        );

        if (foodData.image_url) {
          this.dynamicForm.selectedFileName = foodData.image_url;
          this.dynamicForm.imagePreviewUrl =
            await this.imageService.getImageUrl(foodData.image_url);
        }

        this.dynamicForm.form.patchValue({
          name: foodData.name,
          description: foodData.description,
          price: foodData.price,
          category_id: foodData.category_id,
          extras: extras.map((extra) => extra.id),
          has_day_of_week: foodData.day_of_week !== null,
          day_of_week: foodData.day_of_week || null,
          image_file: foodData.image_url,
        });
        this.dynamicForm.showButton = false;
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private async loadExtrasByCategory(categoryId: string) {
    const extras = await this.extraService.getExtrasByCategory(categoryId);
    this.extras.set(extras);

    this.foodFields.find((f) => f.name === 'extras')!.options =
      this.extras().map((e) => ({ label: e.name, value: e.id }));

    this.dynamicForm.isDisabled['extras'] = false;
  }

  public onAddExtraItem() {
    const dialogRef = this.dialog.open(AddExtraDialogComponent, {
      width: '400px',
      data: { categoryId: this.dynamicForm.form.value.category_id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadExtrasByCategory(this.dynamicForm.form.value.category_id);
      }
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public async onSave(): Promise<void> {
    this.loadingService.showLoading();
    if (this.dynamicForm.form.invalid) {
      return;
    }

    try {
      const formData = this.dynamicForm.form.value;
      let imageUrl = formData.image_file;

      if (formData.image_file && formData.image_file instanceof File) {
        if (this.data.foodId && this.dynamicForm.selectedFileName) {
          console.log(this.imageUrl);
          await this.imageService.deleteImage(this.imageUrl as string);
        }

        imageUrl = await this.imageService.uploadImage(
          formData.image_file,
          `food-images/${formData.image_file.name}`
        );
      }

      const foodData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category_id: formData.category_id,
        company_id: this.companyId(),
        image_url: imageUrl,
        day_of_week: formData.day_of_week || null,
      };

      const extraIds = formData.extras || [];

      if (this.data.foodId) {
        await this.foodService.updateFoodWithExtras(
          this.data.foodId,
          foodData,
          extraIds
        );
        this.toastr.success('Item atualizado com sucesso!');
      } else {
        await this.foodService.createFoodWithExtras(foodData, extraIds);
        this.toastr.success('Item criado com sucesso!');
      }

      this.dialogRef.close(true);
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private addDayOfWeekField(form: FormGroup): void {
    if (!form.contains('day_of_week') && form.get('has_day_of_week')?.value) {
      form.addControl('day_of_week', new FormControl('', Validators.required));

      const hasDayOfWeekIndex = this.foodFields.findIndex(
        (field) => field.name === 'has_day_of_week'
      );

      this.foodFields.splice(hasDayOfWeekIndex + 1, 0, {
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
      this.foodFields = this.foodFields.filter(
        (field) => field.name !== 'day_of_week'
      );
    }
  }
}
