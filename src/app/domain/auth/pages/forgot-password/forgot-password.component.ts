import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';

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
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);

  public loading = signal(false);
  public forgotFields: iDynamicField[] = [
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      validators: [Validators.required, Validators.email],
    },
  ];

  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );

  public async submit() {
    this.loading.set(true);

    if (!this.dynamicForm.form.valid) {
      this.toastr.error('Preencha o campo e-mail!', 'Erro!');
      return;
    }

    const { email } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      this.toastr.error('Ocorreu um erro interno!', 'Erro!');
      return;
    }

    this.dynamicForm.form.reset();
    this.toastr.success(
      'E-mail enviado com sucesso! Verifique sua caixa de entrada.',
      'Sucesso!'
    );
    this.loading.set(false);
  }
}
