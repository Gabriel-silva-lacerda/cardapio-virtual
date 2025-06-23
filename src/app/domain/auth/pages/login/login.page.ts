import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CompanyService } from '@shared/services/company/company.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '@shared/services/error-handler/error-handler.service';
import { fade, fadeIn } from '@shared/utils/animations.utils';
import { AuthService } from '../../services/auth.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { UserCompanyService } from '../../services/user-company.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, RouterLink, LoadingComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  animations: [fadeIn, fade],
})
export class LoginPage {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  public companyService = inject(CompanyService);
  private localStorageService = inject(LocalStorageService);
  private supabase = injectSupabase();
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);
  private authService = inject(AuthService);
  private userCompanyService = inject(UserCompanyService)

  public isEmailConfirmed = signal(true);
  public loading = signal(false);

  public loginFields: iDynamicField[] = [
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
    this.setLoading(true);
    if (!this.dynamicForm.form.valid) return this.setLoading(false);

    const { email, password } = this.dynamicForm.form.value;
    const companyName = this.companyService.companyName();
    if (!companyName) return this.fail('Empresa não informada.');

    const company = await this.companyService.getByField<any>('unique_url', companyName);
    if (!company) return this.fail('Empresa não encontrada.');

    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({ email, password });
    if (authError) return this.handleAuthError(authError);

    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) return this.fail('Erro ao obter dados do usuário.');

    const userId = userData.user.id;
    const userCompany = await this.userCompanyService.getByField<any>('user_id', userId);

    if (!userCompany || userCompany.company_id !== company.id) {
      return this.fail('Usuário não tem acesso a esta empresa.');
    }

    this.authService.isAdmin.set(userCompany.role === 'admin');
    this.authService.setAdminMode(userCompany.role === 'admin');
    this.authService.isLogged.set(true);
    this.authService.getUser(userId);
    this.setLoading(false);

    const firstLogin = userData.user.user_metadata?.['first_login'];
    const nextRoute = firstLogin ? ['/auth/reset-password'] : ['/app', companyName];
    this.router.navigate(nextRoute);
  }

  public async resendConfirmation() {
    this.setLoading(true);

    const { email } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.resend({ type: 'signup', email });

    if (error) {
      this.toastrService.error('Erro ao reenviar o código de confirmação.', 'Erro');
    } else {
      this.toastrService.success('Código de confirmação reenviado com sucesso!', 'Sucesso');
      this.isEmailConfirmed.set(true);
    }

    this.setLoading(false);
  }

  public viewMenu() {
    this.authService.isAdmin.set(false);
    this.router.navigate(['/app', this.companyService.companyName()]);
  }

  private setLoading(value: boolean) {
    this.loading.set(value);
  }

  private fail(message: string) {
    this.toastrService.error(message, 'Erro');
    this.localStorageService.clearSupabaseAuthToken();
    this.setLoading(false);
  }

  private handleAuthError(error: any) {
    if (error.message.includes('Email not confirmed')) {
      this.toastrService.error('Por favor, confirme seu e-mail antes de continuar.', 'Erro');
      this.isEmailConfirmed.set(false);
    } else {
      this.errorHandler.handleError(error.message);
    }

    this.setLoading(false);
  }
}
