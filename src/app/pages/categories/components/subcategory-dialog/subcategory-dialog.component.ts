import { ToastrService } from 'ngx-toastr';
import {
  Component,
  inject,
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

@Component({
  selector: 'app-subcategory-dialog',
  imports: [DynamicFormComponent, GenericDialogComponent, ButtonComponent],
  templateUrl: './subcategory-dialog.component.html',
  styleUrl: './subcategory-dialog.component.scss',
})
export class SubcategoryDialogComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private dialogRef = inject(MatDialogRef<SubcategoryDialogComponent>);
  private categoryService = inject(CategoryService);
  private toastr = inject(ToastrService);
  public loading = signal(false);

  public categories = inject<WritableSignal<iCategory[]>>(MAT_DIALOG_DATA);

  public subcategoryFields = [
    {
      name: 'name',
      label: 'Nome da subcategoria',
      type: 'text',
      validators: [Validators.required],
      placeholder: 'Ex: Combos, Lanche Família',
    },
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
  ];

  onClose() {
    this.dialogRef.close();
  }

  async onSave() {
    const { name, category_id } = this.dynamicForm.form.value;

    console.log(name, category_id);
    if (!name || !category_id) {
      this.toastr.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      this.loading.set(true);
      const value = await this.categoryService.insert('subcategories', {
        name,
        category_id,
      });

      this.toastr.success('Subcategoria criada com sucesso!');
      this.dialogRef.close(true);
    } finally {
      this.loading.set(false);
    }
  }
}
