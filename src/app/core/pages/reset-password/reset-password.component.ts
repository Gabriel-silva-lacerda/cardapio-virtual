import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { CompanyService } from '@shared/services/company/company.service';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private supabase = injectSupabase();
  private router = inject(Router);
  private toast = inject(ToastService);
  public companyService = inject(CompanyService);

  public resetFields: iDynamicField[] = [
    {
      name: 'password',
      label: 'Nova Senha',
      type: 'password',
      validators: [Validators.required, Validators.minLength(6)],
    },
  ];

  public async submit() {
    if (!this.dynamicForm.form.valid) {
      this.toast.error('Preencha o campo senha!');
      return;
    }

    const { password } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.updateUser({
      password: password,
      data: { first_login: false }
    });

    if (error) {
      this.toast.error(error.message);
      return;
    }

    this.dynamicForm.form.reset();
    this.toast.success('Senha atualizada com sucesso!');
    this.router.navigate(['/auth', this.companyService.companyName()]);
  }
}
