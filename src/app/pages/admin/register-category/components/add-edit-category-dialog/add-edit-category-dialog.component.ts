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
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
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
  public data = inject(MAT_DIALOG_DATA) as { isEditCategory: any, category: any, subcategory: any};
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
      name: 'has_subcategory',
      label: 'Essa categoria terá subcategorias?',
      type: 'checkbox',
      padding: '10px',
      defaultValue: false
    },
    {
      name: 'subcategory_name',
      label: 'Nome da subcategoria',
      placeholder: 'Tradicional, Refrigerante, etc.',
      type: 'text',
      validators: [],
      padding: '10px',
      visibleIf: (form) => form.get('has_subcategory')?.value === true,
    },
  ];


  ngAfterViewInit() {
    this.patchForm();
  }

  private patchForm(): void {
    if (!this.data.category) return;

    this.loading.set(true);

    const isEdit = this.data.isEditCategory;


    this.dynamicForm.form.patchValue({
      name: this.data.category?.name,
      has_subcategory: !!this.data.subcategory,
      subcategory_name: this.data.subcategory?.name || '',
    });

    if (!isEdit)
      this.dynamicForm.disableFields(['name']);

    if (isEdit)
      this.categoryFields = this.categoryFields.filter(f => f.name !== 'subcategory_name' && f.name !== 'has_subcategory');

    this.loading.set(false);
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public async onSave(): Promise<void> {
    if (this.dynamicForm.form.invalid) return;

    this.loading.set(true);
    try {
      const { name, has_subcategory, subcategory_name } = this.dynamicForm.form.value;
      console.log(has_subcategory)
      const companyId = this.companyService.companyId();

      const category = await this.saveCategory(name, companyId, has_subcategory);

      let subcategorySaved = null;
      if (has_subcategory && subcategory_name?.trim()) {
        subcategorySaved = await this.saveSubcategory(subcategory_name, category.id, companyId);
      }

      const message = this.getSuccessMessage(!!has_subcategory, !!subcategorySaved);
      this.toast.success(message);

      this.dialogRef.close(category);
    } finally {
      this.loading.set(false);
    }
  }

  private async saveCategory(name: string, company_id: string, has_subcategory: boolean): Promise<iCategory> {
    if (this.data.category) {
      return this.categoryService.update(this.data.category.id, { name, company_id, has_subcategory });
    }

    return this.categoryService.insert({ name, company_id, has_subcategory });
  }

  private async saveSubcategory(name: string, category_id: string | undefined, company_id: string): Promise<iSubcategory | null> {
    if (!name) return null;

    if (this.data.subcategory?.id) {
      return this.subcategoryService.update(this.data.subcategory.id, { name, category_id, company_id });
    }

    return this.subcategoryService.insert({ name, category_id, company_id });
  }

  private getSuccessMessage(hasSubcategory: boolean, subcategorySaved: boolean): string {
    if (this.data.isEditCategory) {
      return 'Categoria editada com sucesso!';
    }

    if (hasSubcategory && subcategorySaved) {
      return 'Subcategoria criada com sucesso!';
    }

    return 'Categoria criada com sucesso!';
  }
}
