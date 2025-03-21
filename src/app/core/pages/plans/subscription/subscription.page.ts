import cepPromise from 'cep-promise';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { debounceTime, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { BRAZILIAN_STATES } from 'src/app/pages/cart/components/payment-address-dialog/payment-address-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { PlansService } from '@shared/services/plans/plans.service';
import { Plans } from '@shared/interfaces/plans.interface';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from 'src/app/pages/cart/services/payment.service';
import { SubscriptonService } from '@shared/services/subscription/subscripton.service';
import { EmailService } from '@shared/services/email.service';
import { JsonPipe } from '@angular/common';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { StripeService } from '@shared/services/stripe/stripe.service';

@Component({
  selector: 'app-subscription',
  imports: [DynamicFormComponent, FormsModule, LoadingComponent],
  templateUrl: './subscription.page.html',
  styleUrl: './subscription.page.scss',
})
export class SubscriptionPage {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private route = inject(ActivatedRoute);
  private plansService = inject(PlansService);
  private toastr = inject(ToastrService);
  private paymentService = inject(PaymentService);
  private subscriptionService = inject(SubscriptonService);
  private stripeService = inject(StripeService);

  public loadingService = inject(LoadingService);
  public destroy$ = new Subject<void>();
  public cepSubject = new Subject<string>();
  public addressFields: iDynamicField[] = [
    {
      name: 'fullName',
      label: 'Nome Completo',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'name',
      label: 'Nome da Empresa',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      validators: [Validators.required, Validators.email],
      padding: '10px',
    },
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
      // options: BRAZILIAN_STATES,
      validators: [Validators.required],
      padding: '10px',
    },
    {
      name: 'state',
      label: 'Estado',
      type: 'text',
      validators: [Validators.required],
      padding: '10px',
    },
  ];

  planId!: number | string | null;
  plan = signal<Plans>({} as Plans);

  async ngOnInit() {
    this.cepSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((cep) => this.searchCep(cep, this.dynamicForm.form));

    const params = await firstValueFrom(this.route.paramMap);
    this.planId = params.get('id');
    if (this.planId) this.getPlanById(this.planId);
  }

  async getPlanById(planId: string) {
    const plan = await this.plansService.getByField<Plans>('plans', 'id', +planId);

    this.plan.set(plan as unknown as Plans);
    console.log(this.plan());

  }

  async searchCep(value: string, form: FormGroup) {
    const control = form.get('cep');
    if (control?.invalid && value.length < 8) return;

    this.loadingService.showLoading();

    try {
      const addressData = await cepPromise(value);

      form.patchValue({
        street: addressData.street,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
      });

      this.dynamicForm.disableFields([
        'street',
        'neighborhood',
        'city',
        'state',
      ]);
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
      this.loadingService.hideLoading();
    }
  }

  async onSubmit() {
    // if (this.dynamicForm.form.valid) {
    const formData = this.dynamicForm.form.getRawValue();

    // Exemplo de dados capturados
    const companyData = {
      fullName: formData.fullName,
      name: formData.name,
      email: formData.email,
      cep: formData.cep,
      street: formData.street,
      number: formData.number,
      neighborhood: formData.neighborhood,
      complement: formData.complement,
      city: formData.city,
      state: formData.state,
      plan_id: this.plan().id,
    };
    console.log(companyData);

    const data = await this.subscriptionService.registerCompanyWithSubscription(companyData);

    if(!data.success) {
      console.log(data.message);
    }

    console.log(data.company);

    if(data.company)
    this.stripeService.createCheckoutSession(this.plan().price_id, data?.company.id);
  }
}
