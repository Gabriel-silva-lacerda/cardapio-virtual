import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { iCategory } from '@shared/interfaces/category/category.interface';
import { CompanyService } from '@shared/services/company/company.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';

@Component({
  selector: 'app-add-edit-category-dialog',
  imports: [GenericDialogComponent, LoadingScreenComponent, DynamicFormComponent, ButtonComponent],
  templateUrl: './add-edit-category-dialog.component.html',
  styleUrl: './add-edit-category-dialog.component.scss'
})
export class AddEditCategoryDialogComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);

  private companyService = inject(CompanyService);
  private toast = inject(ToastService);

  public loadingService = inject(LoadingService);
  public dialogRef = inject(MatDialogRef<AddEditCategoryDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as { category: any, subcategory: any};
  public loading = signal(false);

  public categoryFields: iDynamicField[] = [
    {
      name: 'name',
      label: 'Nome da categoria',
      placeholder: 'Pizza, Bebidas, etc.',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
    name: 'subcategory_name',
    label: 'Nome da subcategoria',
    placeholder: 'Tradicional, Refrigerante, etc.',
    type: 'text',
    validators: [Validators.required],
    padding: '10px',
  },
  ];

  ngAfterViewInit() {
    if (this.data.category) {
      this.loading.set(true);
      this.dynamicForm?.form.patchValue({
        name: this.data.category?.name,
      });

      this.loading.set(false);
    }
  }

  onClose() {
    this.dialogRef.close();
  }

 async onSave() {
    if (this.dynamicForm.form.invalid) return;

    try {
      this.loading.set(true);
      const { name, subcategory_name } = this.dynamicForm.form.value;
      const companyId = this.companyService.companyId();

      let category: any;

      // Atualiza ou cria categoria
      if (this.data?.category) {
        category = await this.categoryService.update(this.data?.category.id, { name, company_id: companyId });
      } else {
        category = await this.categoryService.insert({ name, company_id: companyId });
      }

      // Atualiza ou cria subcategoria
      if (category && subcategory_name) {
        if (this.data?.subcategory?.id) {
          await this.subcategoryService.update(this.data?.subcategory?.id, {
            name: subcategory_name,
            category_id: category.id,
            company_id: companyId
          });
        } else {
          await this.subcategoryService.insert({
            name: subcategory_name,
            category_id: category.id,
            company_id: companyId
          });
        }
      }

      this.toast.success('Categoria e subcategoria salvas com sucesso!');
      this.dialogRef.close(category);
    } finally {
      this.loading.set(false);
    }
  }

}
