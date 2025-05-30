import { ToastrService } from 'ngx-toastr';
import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { iCategory } from 'src/app/pages/home/interfaces/category.interface';
import { CategoryService } from 'src/app/pages/home/services/category.service';
import { Validators } from '@angular/forms';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-subcategory-dialog',
  imports: [DynamicFormComponent, GenericDialogComponent, ButtonComponent],
  templateUrl: './subcategory-dialog.component.html',
  styleUrl: './subcategory-dialog.component.scss',
})
export class SubcategoryDialogComponent implements OnInit{
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private dialogRef = inject(MatDialogRef<SubcategoryDialogComponent>);
  private categoryService = inject(CategoryService);
  private localStorageService = inject(LocalStorageService);
  private toastr = inject(ToastrService);

  public loading = signal(false);
  public companyId = this.localStorageService.getSignal('companyId', '0');
  public categories = signal<iCategory[]>([]);
  public subcategoryFields = [
    {
      name: 'category_id',
      label: 'Categoria principal',
      type: 'select',
      validators: [Validators.required],
      options: this.categories().map((c) => ({
        label: c.name,
        value: c.id,
      })),
      placeholder: 'Selecione a categoria',
    },
    {
      name: 'name',
      label: 'Nome da subcategoria',
      type: 'text',
      validators: [Validators.required],
      placeholder: 'Ex: Combos, Lanche Família',
    },

  ];

  async ngOnInit() {
    this.categories.set(await this.categoryService.getAll('categories'));
    const categoryField = this.subcategoryFields.find(f => f.name === 'category_id');
    if (categoryField) {
      categoryField.options = this.categories().map(c => ({
        label: c.name,
        value: c.id
      }));
    }
  }

  async onSave() {
    const { name, category_id } = this.dynamicForm.form.value;

    if (!name || !category_id) {
      this.toastr.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      this.loading.set(true);
      const value = await this.categoryService.insert('subcategories', {
        name,
        category_id,
        company_id: this.companyId(),
      });

      this.toastr.success('Subcategoria criada com sucesso!');
      this.dialogRef.close(category_id);
    } finally {
      this.loading.set(false);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
