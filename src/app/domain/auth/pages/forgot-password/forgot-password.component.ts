import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { CompanyService } from '@shared/services/company/company.service';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, DynamicFormComponent, LoadingComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private supabase = injectSupabase();
  private toast = inject(ToastService);
  public companyService = inject(CompanyService);

  public loading = signal(false);
  public forgotFields: iDynamicField[] = [
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      validators: [Validators.required, Validators.email],
    },
  ];


  public async submit() {
    this.loading.set(true);

    if (!this.dynamicForm.form.valid) {
      this.toast.error('Preencha o campo e-mail!');
      return;
    }

    const { email } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      this.toast.error('Ocorreu um erro interno!');
      return;
    }

    this.dynamicForm.form.reset();
    this.toast.success('E-mail enviado com sucesso! Verifique sua caixa de entrada.');
    this.loading.set(false);
  }
}
