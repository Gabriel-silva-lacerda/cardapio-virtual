import cepPromise from 'cep-promise';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { debounceTime, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlansService } from '@shared/services/plans/plans.service';
import { Plans } from '@shared/interfaces/plans/plans.interface';
import { CurrencyPipe } from '@angular/common';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { StripeService } from '@shared/services/stripe/stripe.service';
import { Company } from '@shared/interfaces/company/company';
import { BRAZILIAN_STATES } from '@shared/constants/brazilian-states';
import { fade } from '@shared/utils/animations.util';
import { CompanyService } from '@shared/services/company/company.service';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'app-subscription',
  imports: [
    DynamicFormComponent,
    FormsModule,
    LoadingComponent,
    CurrencyPipe,
    RouterLink,
  ],
  templateUrl: './subscription.page.html',
  styleUrl: './subscription.page.scss',
  animations: [fade],
})
export class SubscriptionPage {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private route = inject(ActivatedRoute);
  private plansService = inject(PlansService);
  private toast = inject(ToastService);
  private stripeService = inject(StripeService);
  private planId!: number | string | null;
  private companyService = inject(CompanyService);

  public loading = signal(false);
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

  public plan = signal<Plans>({} as Plans);

  async ngOnInit() {
    this.getCep();

    const params = await firstValueFrom(this.route.paramMap);
    this.planId = params.get('id');
    if (this.planId) this.getPlanById(this.planId);
  }

  private getCep() {
    this.cepSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((cep) => this.searchCep(cep, this.dynamicForm.form));
  }

  async getPlanById(planId: string) {
    const plan = await this.plansService.getByField<Plans>(
      'plans',
      'id',
      planId
    );

    this.plan.set(plan as unknown as Plans);
  }

  async searchCep(value: string, form: FormGroup) {
    const control = form.get('cep');
    if (control?.invalid && value.length < 8) return;

    this.loading.set(true);

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
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (!this.dynamicForm.form.valid) {
      return;
    }

    try {
      const formData = this.dynamicForm.form.getRawValue();

      const unique_url = this.generateUniqueUrl(formData.name);
      const { exists, company, email } =
        await this.companyService.checkIfCompanyOrEmailExists(
          formData.name,
          formData.email,
          unique_url
        );
      if (exists) {
        const fieldErrors = {
          company: {
            field: 'name',
            message: 'Já existe uma empresa com este nome!',
          },
          email: { field: 'email', message: 'Este e-mail já está cadastrado!' },
          unique_url: {
            field: 'name',
            message: 'Já existe uma empresa com este nome!',
          },
        };

        Object.entries({ company, unique_url, email }).forEach(
          ([key, value]) => {
            if (value) {
              const field =
                key === 'unique_url'
                  ? 'name'
                  : fieldErrors[key as keyof typeof fieldErrors].field;

              this.dynamicForm.form.controls[field].setErrors({
                customError:
                  fieldErrors[key as keyof typeof fieldErrors].message,
              });
            }
          }
        );

        return;
      }

      const companyData: Company = {
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
        delivery_fee_per_km: 2,
      };

      await this.stripeService.createCheckoutSession(
        this.plan().price_id,
        companyData,
        formData.fullName,
        this.plan().id
      );
    } catch (error) {
      console.error('Erro ao processar o cadastro:', error);
    }
  }

  private generateUniqueUrl(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
