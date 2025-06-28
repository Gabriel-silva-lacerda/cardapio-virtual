import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
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
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { fadeInOut } from '@shared/utils/animations.util';
import { PaymentComponent } from '../payment/payment.component';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { OrderService } from '@shared/services/order/order.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { SaveAddressDialogComponent } from '../save-address-dialog/save-address-dialog.component';
import { BRAZILIAN_STATES } from '@shared/constants/brazilian-states';
import { CardAddressComponent } from '../card-address/card-address.component';
import { PickupOptionComponent } from '../pickup-option/pickup-option.component';
import { ViacepService } from '@shared/services/via-cep/viacep.service';
import { ViaCep, ViaCepError } from '@shared/interfaces/via-cep/via-cep';
import { DeliveryAddress } from '../../interfaces/address';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';
import { SkeletonButtonComponent } from '../skeleton-button/skeleton-button.component';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { DeliveryAddressService } from '@shared/services/order/delivery-address.service';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'app-payment-address-dialog',
  imports: [
    FormsModule,
    DynamicFormComponent,
    LoadingComponent,
    MatTooltipModule,
    PaymentComponent,
    CardAddressComponent,
    PickupOptionComponent,
    SkeletonCardComponent,
    SkeletonButtonComponent,
    GenericDialogComponent,
  ],
  templateUrl: './payment-address-dialog.component.html',
  styleUrl: './payment-address-dialog.component.scss',
  animations: [fadeInOut],
})
export class PaymentAddressDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<PaymentAddressDialogComponent>);
  private viaCepService = inject(ViacepService);
  private deliveryAddressService = inject(DeliveryAddressService)

  public data = inject<iCartItem[]>(MAT_DIALOG_DATA);
  public selectedDelivery = signal(true);
  public isSelectAddress = signal(false);
  public selectedAddress = signal<DeliveryAddress>({} as DeliveryAddress);
  public cepSubject = new Subject<string>();
  public destroy$ = new Subject<void>();
  public loading = signal({
    viaCep: false,
    insertDelivery: false,
    selectedAddressFromDatabase: false,
  });

  public showPayment = this.orderService.showPayment;
  public deliveryAddressSaved = signal<DeliveryAddress[]>([]);

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

  ngOnInit() {
    this.initCepListener();
    this.getDeliveryAddressSaved();
    this.loadSelectedAddressFromDatabase();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  private initCepListener(): void {
    this.cepSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((cep) => this.searchCep(cep, this.dynamicForm.form));
  }

  private async loadSelectedAddressFromDatabase(): Promise<void> {
    this.loading.update((l) => ({ ...l, selectedAddressFromDatabase: true }));
    try {
      const selected = await this.deliveryAddressService.getByField<DeliveryAddress>(
        'is_default',
        true
      );

      if (selected && selected.is_default) {
        this.isSelectAddress.set(true);
        this.selectedAddress.set(selected);
      }
    } catch (error) {
      this.toast.error('Erro ao carregar endereço padrão');
    } finally {
      this.loading.update((l) => ({ ...l, selectedAddressFromDatabase: false }));
    }
  }

  async getDeliveryAddressSaved() {
    const deliveryAddressSaved = await this.deliveryAddressService.getAllByField(
      'user_id',
      this.authService.currentUser()?.id as string
    );

    this.deliveryAddressSaved.set(deliveryAddressSaved as any);
  }

  async searchCep(value: string, form: FormGroup) {
    const control = form.get('cep');
    if (control?.invalid && value.length < 8) return;

    this.loading.update((l) => ({ ...l, viaCep: true }));

    this.viaCepService.getCep(value).subscribe({
      next: (addressData: ViaCep | ViaCepError) => {
        if ((addressData as ViaCepError).erro === 'true') {
          this.toast.error('CEP não encontrado ou inválido.');

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
        } else {
          const validAddressData = addressData as ViaCep;

          form.patchValue({
            street: validAddressData.logradouro,
            neighborhood: validAddressData.bairro,
            city: validAddressData.localidade,
            state: validAddressData.uf,
          });

          form.get('street')?.markAsTouched();
          form.get('neighborhood')?.markAsTouched();
          form.get('city')?.markAsTouched();
          form.get('state')?.markAsTouched();

          this.dynamicForm.disableFields([
            'street',
            'neighborhood',
            'city',
            'state',
          ]);
        }
      },
      error: () => {
        this.toast.error('CEP não encontrado ou inválido.');

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
      },
      complete: () => {
        this.loading.update((l) => ({ ...l, viaCep: false }));
      },
    });
  }

  openSaveAddressDialog() {
    const dialogRef = this.dialog.open(SaveAddressDialogComponent, {
      width: '400px',
      maxWidth: '100%',
      maxHeight: '800px',
      data: this.deliveryAddressSaved(),
    });

    dialogRef.afterClosed().subscribe((selectedAddress) => {
      if (selectedAddress) {
        this.isSelectAddress.set(true);
        this.selectedAddress.set(selectedAddress);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
    this.showPayment.set(false);
  }

  async onConfirm() {
    if (this.selectedDelivery() && this.dynamicForm?.form?.invalid) {
      this.toast.error('Por favor, preencha todos os campos obrigatórios.');
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
        try {
          this.loading.update((l) => ({ ...l, insertDelivery: true }));

          this.selectedAddress.set(
            await this.deliveryAddressService.insert(

              deliveryAddresses
            )
          );
          this.getDeliveryAddressSaved();
        } finally {
          this.loading.update((l) => ({ ...l, insertDelivery: false }));
        }
      } else {
        this.selectedAddress.set(existingAddress as DeliveryAddress);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
