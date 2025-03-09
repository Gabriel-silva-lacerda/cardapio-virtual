import { ChangeDetectorRef, Component, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import cepPromise from 'cep-promise';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { fadeInOut } from '@shared/utils/animations.utils';
import { PaymentComponent } from '../payment/payment.component';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { OrderService } from '@shared/services/order/order.service';

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

@Component({
  selector: 'app-payment-address-dialog',
  imports: [FormsModule, DynamicFormComponent, LoadingComponent, MatTooltipModule, PaymentComponent],
  templateUrl: './payment-address-dialog.component.html',
  styleUrl: './payment-address-dialog.component.scss',
  animations: [fadeInOut]
})
export class PaymentAddressDialogComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private orderService = inject(OrderService);

  public loadingService = inject(LoadingService);
  public selectedDelivery = signal(true);

  public cepSubject = new Subject<string>();
  public destroy$ = new Subject<void>();
  public isLoadig = false;
  public showPayment = this.orderService.showPayment;
  public formData!: any;

  public addressFields: iDynamicField[] = [
    {
      name: 'cep',
      label: 'CEP',
      type: 'text',
      validators: [Validators.required],
      onChange: (cep: string | unknown) => {
        if (!cep)
          this.dynamicForm.clearFields(['street', 'neighborhood', 'city', 'state']);
         else
          this.cepSubject.next(cep as string);

      },
      mask: '00000-000',
      padding: '10px'
    },
    {
      name: 'street',
      label: 'Rua',
      type: 'text',
      validators: [Validators.required],
      padding: '10px'
    },
    {
      name: 'number',
      label: 'Número',
      type: 'text',
      validators: [Validators.required],
      padding: '10px'
    },
    {
      name: 'neighborhood',
      label: 'Bairro',
      type: 'text',
      validators: [Validators.required],
      padding: '10px'
    },
    {
      name: 'complement',
      label: 'Complemento',
      type: 'text',
      validators: [],
      padding: '10px'
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<PaymentAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: iCartItem[]
  ) {
  }


  ngOnInit(): void {
    this.cepSubject.pipe(debounceTime(500), takeUntil(this.destroy$))
    .subscribe((cep) => this.searchCep(cep, this.dynamicForm.form));

    this.cdr.detectChanges();
  }

  async searchCep(value: string, form: FormGroup) {
    const control = form.get('cep');
    if (control?.invalid && value.length < 8) return;

    this.isLoadig = true;

    try {
      const addressData = await cepPromise(value);

      form.patchValue({
        street: addressData.street,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
      });

      form.get('street')?.markAsTouched();
      form.get('neighborhood')?.markAsTouched();
      form.get('city')?.markAsTouched();
      form.get('state')?.markAsTouched();


      this.dynamicForm.disableFields(['street', 'neighborhood', 'city', 'state']);

    } catch (error) {
      this.toastr.error('CEP não encontrado ou inválido.');

      form.patchValue({
        street: null,
        neighborhood: null,
        city: null,
        state: null,
      });

      this.dynamicForm.enableFields(['street', 'neighborhood', 'city', 'state']);
    } finally {
      this.isLoadig = false;
    }
  }

  // get isButtonDisabled() {

  //   if (this.isDelivery())
  //     return this.dynamicForm?.form?.invalid;

  //   return false;
  // }

  setSelectedDelivery(selectedDelivery: boolean) {
    this.selectedDelivery.set(selectedDelivery);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.orderService.showPayment.set(true);
    if (this.selectedDelivery() && this.dynamicForm?.form?.invalid) {
      this.toastr.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.formData = {
      delivery: this.selectedDelivery(),
      address: null
    };

    if (this.selectedDelivery()) {
      this.formData.address = this.dynamicForm.form.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
