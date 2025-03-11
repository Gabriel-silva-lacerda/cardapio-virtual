import { Component, inject, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { ButtonModule } from 'primeng/button';
import { LoadingService } from '@shared/services/loading/loading.service';
import { CompanyService } from '@shared/services/company/company.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, ButtonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  protected loadingService = inject(LoadingService);

  private localStorageService = inject(LocalStorageService);
  private supabase = injectSupabase();
  private router = inject(Router);
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  loginFields: iDynamicField[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validators: [Validators.required, Validators.email],
    },
    {
      name: 'password',
      label: 'Senha',
      type: 'password',
      validators: [Validators.required],
      showForgotPassword: true,
      forgotPasswordLink: '/auth/forgot-password',
    },
  ];

  public async login() {
    this.loadingService.showLoading();

    if (!this.dynamicForm.form.valid) {
      this.loadingService.hideLoading();
      return;
    }

    const { email, password } = this.dynamicForm.form.value;
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Erro ao fazer login:', error.message);
      this.loadingService.hideLoading();
      return;
    }

    // Verificar se o usuário tem a flag first_login no metadata
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Erro ao obter dados do usuário:', userError?.message);
      this.loadingService.hideLoading();
      return;
    }

    const firstLogin = userData.user.user_metadata?.['first_login'];

    this.loadingService.hideLoading();

    if (firstLogin) {
      this.router.navigate(['/auth/reset-password']);
    } else {
      this.router.navigate(['/app'], { queryParams: { empresa: this.companyName() } });
    }
  }
}
