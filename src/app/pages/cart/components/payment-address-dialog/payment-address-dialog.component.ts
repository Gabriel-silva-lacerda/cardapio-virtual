import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
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
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { OrderService } from '@shared/services/order/order.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { SaveAddressDialogComponent } from '../save-address-dialog/save-address-dialog.component';
import { BRAZILIAN_STATES } from '@shared/constants/brazilian-states';
import { Address } from '../../interfaces/address';
import { CardAddressComponent } from '../card-address/card-address.component';

@Component({
  selector: 'app-payment-address-dialog',
  imports: [
    FormsModule,
    DynamicFormComponent,
    LoadingComponent,
    MatTooltipModule,
    PaymentComponent,
    CardAddressComponent,
  ],
  templateUrl: './payment-address-dialog.component.html',
  styleUrl: './payment-address-dialog.component.scss',
  animations: [fadeInOut],
})
export class PaymentAddressDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private localStorageService = inject(LocalStorageService);

  public loadingService = inject(LoadingService);
  public selectedDelivery = signal(true);
  public isSelectAddress = signal(false);
  public selectedAddress = signal<Address>({} as Address);
  public cepSubject = new Subject<string>();
  public destroy$ = new Subject<void>();
  public isLoading = false;
  public showPayment = this.orderService.showPayment;
  public formData!: any;
  public deliveryAddresses = signal([]);

  public addressFields: iDynamicField[] = [
    {
      name: 'cep',
      label: 'CEP',
      type: 'text',
      validators: [Validators.required],
      onChange: (cep: string | unknown) => {
        if (!cep)
          this.dynamicForm.clearFields([
            'street',
            'neighborhood',
            'city',
            'state',
          ]);
        else this.cepSubject.next(cep as string);
      },
      mask: '00000-000',
      padding: '10px',
    },
    {
      name: 'street',
      label: 'Rua',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'number',
      label: 'Número',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'neighborhood',
      label: 'Bairro',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'complement',
      label: 'Complemento',
      type: 'text',
      validators: [],
      padding: '10px',
    },
    {
      name: 'city',
      label: 'Cidade',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'state',
      label: 'Estado',
      type: 'select',
      options: BRAZILIAN_STATES,
      validators: [Validators.required],
      padding: '10px',
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<PaymentAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: iCartItem[]
  ) {}

  ngOnInit() {
    this.cepSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((cep) => this.searchCep(cep, this.dynamicForm.form));
    this.cdr.detectChanges();
    this.getDeliveryAddresses();

    const selectedAddress = this.localStorageService.getItem<Address>(
      'selectedAddress'
    ) as Address;
    if (selectedAddress) this.isSelectAddress.set(true);
    this.selectedAddress.set(selectedAddress);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  async getDeliveryAddresses() {
    const deliveryAddresses = await this.orderService.getAllByField(
      'delivery_addresses',
      'user_id',
      this.authService.currentUser()?.id as string
    );

    this.deliveryAddresses.set(deliveryAddresses as any);
  }

  async searchCep(value: string, form: FormGroup) {
    const control = form.get('cep');
    if (control?.invalid && value.length < 8) return;

    this.isLoading = true;

    try {
      // const addressData = await cepPromise(value);
      // form.patchValue({
      //   street: addressData.street,
      //   neighborhood: addressData.neighborhood,
      //   city: addressData.city,
      //   state: addressData.state,
      // });
      // form.get('street')?.markAsTouched();
      // form.get('neighborhood')?.markAsTouched();
      // form.get('city')?.markAsTouched();
      // form.get('state')?.markAsTouched();
      // this.dynamicForm.disableFields([
      //   'street',
      //   'neighborhood',
      //   'city',
      //   'state',
      // ]);
    } catch (error) {
      this.toastr.error('CEP não encontrado ou inválido.');

      form.patchValue({
        street: null,
        neighborhood: null,
        city: null,
        state: null,
      });

      this.dynamicForm.enableFields([
        'street',
        'neighborhood',
        'city',
        'state',
      ]);
    } finally {
      this.isLoading = false;
    }
  }

  openSaveAddressDialog() {
    const dialogRef = this.dialog.open(SaveAddressDialogComponent, {
      width: '400px',
      maxWidth: '100%',
      data: this.deliveryAddresses(),
    });

    dialogRef.afterClosed().subscribe((selectedAddress) => {
      if (selectedAddress) {
        this.isSelectAddress.set(true);
        this.selectedAddress.set(selectedAddress);
      }
    });
  }

  setSelectedDelivery(selectedDelivery: boolean) {
    this.selectedDelivery.set(selectedDelivery);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onConfirm() {
    if (this.selectedDelivery() && this.dynamicForm?.form?.invalid) {
      this.toastr.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.orderService.showPayment.set(true);

    if (this.selectedDelivery()) {
      const deliveryAddresses = {
        user_id: this.authService.currentUser()?.id,
        ...(this.dynamicForm?.form.getRawValue() || this.selectedAddress()),
      };

      const existingAddress = await this.orderService.getAddressByFields(
        deliveryAddresses
      );

      if (!existingAddress) {
        this.selectedAddress.set(
          await this.orderService.insert(
            'delivery_addresses',
            deliveryAddresses
          )
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
