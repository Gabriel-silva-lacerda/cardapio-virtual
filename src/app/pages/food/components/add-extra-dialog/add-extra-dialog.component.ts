import { Component, inject, Inject, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { ExtraService } from '@shared/services/extra/extra.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-extra-dialog',
  imports: [DynamicFormComponent, ButtonComponent],
  templateUrl: './add-extra-dialog.component.html',
  styleUrl: './add-extra-dialog.component.scss',
})
export class AddExtraDialogComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private extraService = inject(ExtraService);
  private toastr = inject(ToastrService);

  public loadingService = inject(LoadingService);
  public extraFields: iDynamicField[] = [
    {
      name: 'name',
      label: 'Nome do Item',
      type: 'text',
      validators: [Validators.required],
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
  ];

  constructor(
    public dialogRef: MatDialogRef<AddExtraDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subcategoryId: string }
  ) {}

  async onSave() {
    if (this.dynamicForm.form.invalid) {
      return;
    }

    const formData = this.dynamicForm.form.value;

    const extra = await this.extraService.addExtra(
      formData,
      this.data.subcategoryId
    );

    if (extra) {
      this.toastr.success('Extra adicionado com sucesso!');
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
