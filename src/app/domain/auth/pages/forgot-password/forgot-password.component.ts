import { NgIf } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DynamicFormComponent } from '@shared/dynamic-form/dynamic-form.component';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iDynamicField } from '@shared/dynamic-form/interfaces/dynamic-filed';
import { LoadingService } from '@shared/services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgIf, RouterLink, DynamicFormComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private supabase = injectSupabase();
  private toastr = inject(ToastrService);

  protected loadingService = inject(LoadingService);

  public forgotFields: iDynamicField[] = [
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      validators: [Validators.required, Validators.email],
    },
  ];

  public async submit() {
    this.loadingService.showLoading();

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
    this.loadingService.hideLoading();
  }
}
