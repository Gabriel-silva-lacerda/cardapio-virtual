import { Component, inject, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
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

  public existingExtras: iExtra[] = [];
  public showSelectExtra = false;
  public showForm = false;

  public extraFields: iDynamicField[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddExtraDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.showSelectExtra = this.data;

    if (this.showSelectExtra) {
      await this.loadExistingExtras();
      this.setSelectExtraFields();
    } else {
      this.setManualEntryFields();
    }
  }

  private async loadExistingExtras() {
    this.existingExtras = await this.extraService.getAll<iExtra>('extras');
  }

  private setSelectExtraFields() {
    this.extraFields = [
      {
        name: 'extra_id',
        label: 'Selecione um adicional',
        type: 'select',
        options: this.existingExtras.map((extra) => ({
          label: `${extra.name} - R$${extra.price}`,
          value: extra.id,
        })),
        onChange: (extraId: unknown) => this.onSelectExtra(extraId as string),
        validators: [Validators.required],
      },
      this.getPriceField(),
    ];

    this.renderForm();
  }

  private setManualEntryFields(extra?: iExtra) {
    this.extraFields = [
      {
        name: 'name',
        label: 'Nome do Item',
        type: 'text',
        validators: [Validators.required],
        padding: '10px',
      },
      this.getPriceField(),
    ];

    this.renderForm();
  }

  private getPriceField(): iDynamicField {
    return {
      name: 'price',
      label: 'Preço',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
      directive: 'onlyNumbers',
    };
  }

  private renderForm() {
    this.showForm = false;
    setTimeout(() => this.showForm = true);
  }

  private onSelectExtra(extraId: string) {
    const selected = this.existingExtras.find((e) => e.id === extraId);
    if (!selected) return;

    this.showSelectExtra = false;
    this.setManualEntryFields(selected);
    setTimeout(() => {
    if (this.dynamicForm?.form) {
      this.dynamicForm.form.patchValue({
        name: selected.name,
        price: selected.price.toString(),
      });
    }
  });
  }

  async onSave() {
    if (this.dynamicForm.form.invalid) return;

    const { name, price } = this.dynamicForm.form.value;

    const extraData = await this.extraService.insert<iExtra>('extras', { name, price });

    if (extraData) {
      this.toastr.success('Extra adicionado com sucesso!');
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
