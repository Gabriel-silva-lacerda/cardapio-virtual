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

@Component({
  selector: 'app-add-edit-category-dialog',
  imports: [GenericDialogComponent, LoadingScreenComponent, DynamicFormComponent, ButtonComponent],
  templateUrl: './add-edit-category-dialog.component.html',
  styleUrl: './add-edit-category-dialog.component.scss'
})
export class AddEditCategoryDialogComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private categoryService = inject(CategoryService);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);

  public loadingService = inject(LoadingService);
  public dialogRef = inject(MatDialogRef<AddEditCategoryDialogComponent>);
  public category = inject(MAT_DIALOG_DATA) as iCategory | undefined;
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
  ];

  ngAfterViewInit() {
    if (this.category) {
      this.loading.set(true);
      this.dynamicForm?.form.patchValue({
        name: this.category?.name,
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
      const formData = this.dynamicForm.form.value;
      let category;

      if (this.category) {
        category = await this.categoryService.update(this.category?.id, {...formData, company_id: this.companyService.companyId() });
        this.toast.success('Categoria atualizada com sucesso!');
      } else {
        category = await this.categoryService.insert({...formData, company_id: this.companyService.companyId() });
        this.toast.success('Categoria criada com sucesso!');
      }

      if(category) this.dialogRef.close(category);
    }
    finally {
      this.loading.set(false);
    }
  }
}
