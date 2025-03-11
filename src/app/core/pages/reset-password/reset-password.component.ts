import { Component, inject, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { ToastrService } from 'ngx-toastr';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { CompanyService } from '@shared/services/company/company.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

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
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

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
      this.toastr.error('Preencha o campo senha!', 'Erro!');
      return;
    }

    const { password } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.updateUser({
      password: password,
      data: { first_login: false }
    });

    if (error) {
      this.toastr.error(error.message, 'Erro');
      return;
    }

    this.dynamicForm.form.reset();
    this.toastr.success('Senha atualizada com sucesso!', 'Sucesso!');
    this.router.navigate(['/auth'], { queryParams: { empresa: this.companyName() } });
  }
}
