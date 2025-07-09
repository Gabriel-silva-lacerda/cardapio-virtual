import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { LoadingScreenComponent } from '@shared/components/loading-screen/loading-screen.component';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
import { CompanyService } from '@shared/services/company/company.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { CategoryService } from 'src/app/pages/client/home/services/category.service';
import { SubcategoryService } from 'src/app/pages/client/home/services/subcategory.service';

@Component({
  selector: 'app-add-edit-subcategory-dialog',
  imports: [GenericDialogComponent, LoadingScreenComponent, DynamicFormComponent, ButtonComponent],
  templateUrl: './add-edit-subcategory-dialog.component.html',
  styleUrl: './add-edit-subcategory-dialog.component.scss'
})
export class AddEditSubcategoryDialogComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private subcategoryService = inject(SubcategoryService);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);
  private categoryService = inject(CategoryService);
  public loadingService = inject(LoadingService);
  public dialogRef = inject(MatDialogRef<AddEditSubcategoryDialogComponent>);
  public subcategory = inject(MAT_DIALOG_DATA) as iSubcategory | undefined;
  public loading = signal(false);
  // public categories = signal<iCategory[]>([]);

  public subcategoryFields: iDynamicField[] = [
    {
      name: 'name',
      label: 'Nome da subcategoria',
      placeholder: 'Ex: Tradicionais, Especiais, etc.',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'category_id',
      label: 'Categoria',
      type: 'select',
      options: [], // vai popular depois
      validators: [Validators.required],
      padding: '10px',
    }
  ];

  async ngAfterViewInit() {
    this.loading.set(true);

    // Buscar categorias da empresa e popular o campo select
    const companyId = this.companyService.companyId();
    const categories = await this.categoryService.getAllByField('company_id',companyId) as any;
    // this.categories.set(categories);

    // Atualizar opções do select no campo 'category_id'
    const selectField = this.subcategoryFields.find(f => f.name === 'category_id');
    if (selectField) {
      selectField.options = categories.map((c: any) => ({ label: c.name, value: c.id }));
    }

    if (this.subcategory) {
      const patchData: any = {
        name: this.subcategory.name,
        category_id: this.subcategory.category_id || null,
      };

      this.dynamicForm?.form.patchValue(patchData);
    }

    this.loading.set(false);
  }


  onClose() {
    this.dialogRef.close();
  }

  async onSave() {
    if (this.dynamicForm.form.invalid) return;
    try {
      this.loading.set(true);
      const formData = this.dynamicForm.form.value;
      let subcategory;

      if (this.subcategory) {
        subcategory = await this.subcategoryService.update(
          this.subcategory.id,
          { ...formData, company_id: this.companyService.companyId() }
        );

        if(subcategory) this.toast.success('Subcategoria atualizada com sucesso!');
      } else {
        subcategory = await this.subcategoryService.insert({ ...formData, company_id: this.companyService.companyId() });
        this.toast.success('Subcategoria criada com sucesso!');
      }

      if (subcategory) this.dialogRef.close(subcategory);
    }
    finally {
      this.loading.set(false);
    }
  }
}
