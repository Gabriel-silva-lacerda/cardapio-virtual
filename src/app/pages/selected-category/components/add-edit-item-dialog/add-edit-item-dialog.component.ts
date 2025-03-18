import {
  Component,
  inject,
  Inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { CompanyService } from '@shared/services/company/company.service';
import { FoodService } from '@shared/services/food/food.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ImageService } from '@shared/services/image/image.service';
import { iCategory } from '../../../home/interfaces/category.interface';
import { CategoryService } from '../../../home/services/category.service';
import { iExtra } from '../../../selected-food/interfaces/extra.interface';
import { ExtraService } from '../../../selected-food/services/extra/extra.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'app-add-edit-item-dialog',
  imports: [DynamicFormComponent, LoadingComponent],
  templateUrl: './add-edit-item-dialog.component.html',
  styleUrl: './add-edit-item-dialog.component.scss',
})
export class AddEditItemDialogComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private localStorageService = inject(LocalStorageService);
  private categoryService = inject(CategoryService);
  private extraService = inject(ExtraService);
  private uploadService = inject(ImageService);
  private foodService = inject(FoodService);
  private toastr = inject(ToastrService);
  public loadingService = inject(LoadingService);

  public companyId = this.localStorageService.getSignal(
    'companyId',
    0
  );
  public categories = signal<{ id: number; name: string }[]>([]);
  public extras = signal<{ id: number; name: string }[]>([]);

  foodFields: iDynamicField[] = [
    {
      name: 'name',
      label: 'Nome do Prato',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      validators: [],
      padding: '10px',
    },
    {
      name: 'price',
      label: 'Preço',
      type: 'number',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'category_id',
      label: 'Categoria',
      type: 'select',
      options: this.categories().map((c) => ({ label: c.name, value: c.id })),
      validators: [Validators.required],
      padding: '10px',
      onChange: (data: unknown, form: FormGroup) => {
        const categoryId = Number(data);
        if (!isNaN(categoryId)) {
          this.loadExtrasByCategory(categoryId);
        }
      }
    },
    {
      name: 'extras',
      label: 'Adicionais',
      type: 'multiselect',
      options: this.extras().map((e) => ({ label: e.name, value: e.id })),
      validators: [],
      padding: '10px',
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
      validators: [],
      padding: '10px',
      onFileUpload: async (file, form) => {
        form.patchValue({ image_file: file });
      },
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<AddEditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.categories.set(await this.categoryService.getAll('categories'));
    this.foodFields.find(f => f.name === 'category_id')!.options = this.categories().map(c => ({ label: c.name, value: c.id }));
  }

  private async loadExtrasByCategory(categoryId: number): Promise<any> {
    const extras = await this.extraService.getExtrasByCategory(categoryId);
    this.extras.set(extras.data);

    this.foodFields.find(f => f.name === 'extras')!.options = this.extras().map(e => ({ label: e.name, value: e.id }));
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

      let imageUrl = null;

      if (formData.image_file) {
        imageUrl = await this.uploadService.uploadImage(
          formData.image_file,
          `food-images/${formData.image_file.name}`
        );
      }

      const newFood = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category_id: formData.category_id,
        company_id: this.companyId(),
        image_url: imageUrl,
        day_of_week: formData.day_of_week || null,
      };

      const extraIds = formData.extras || [];

      await this.foodService.createFoodWithExtras(newFood, extraIds);

      this.toastr.success('Item criado com sucesso!')
      this.dialogRef.close(true);
    } finally  {
      this.loadingService.hideLoading();
    }
  }

  private addDayOfWeekField(form: FormGroup): void {
    if (!form.contains('day_of_week')) {
      form.addControl('day_of_week', new FormControl('', Validators.required));
  
      const hasDayOfWeekIndex = this.foodFields.findIndex(field => field.name === 'has_day_of_week');
  
      this.foodFields.splice(hasDayOfWeekIndex + 1, 0, {
        name: 'day_of_week',
        label: 'Dia da Semana',
        type: 'select',
        options: [
          { label: 'Segunda-feira', value: 'monday' },
          { label: 'Terça-feira', value: 'tuesday' },
          { label: 'Quarta-feira', value: 'wednesday' },
          { label: 'Quinta-feira', value: 'thursday' },
          { label: 'Sexta-feira', value: 'friday' },
          { label: 'Sábado', value: 'saturday' },
          { label: 'Domingo', value: 'sunday' },
        ],
        validators: [Validators.required],
        padding: '10px',
      });
    }
  }

  private removeDayOfWeekField(form: FormGroup): void {
    console.log(form);
    console.log("aqui");

    if (form.contains('day_of_week')) {
      console.log("aqui");

      form.removeControl('day_of_week');
      this.foodFields = this.foodFields.filter(field => field.name !== 'day_of_week');
    }
  }
}
