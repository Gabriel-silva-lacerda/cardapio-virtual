import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { ButtonModule } from 'primeng/button';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CompanyService } from '@shared/services/company/company.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '@shared/services/error-handler/error-handler.service';
import { fadeIn } from '@shared/utils/animations.utils';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, ButtonModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  animations: [fadeIn]
})
export class LoginPage {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  protected loadingService = inject(LoadingService);

  private companyService = inject(CompanyService);
  private localStorageService = inject(LocalStorageService);
  private supabase = injectSupabase();
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);
  private authService = inject(AuthService);

  public isEmailConfirmed = signal(true);

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
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
    this.loadingService.showLoading();

    if (!this.dynamicForm.form.valid) {
      this.loadingService.hideLoading();
      return;
    }

    const { email, password } = this.dynamicForm.form.value;
    const companyName = this.companyName();

    if (!companyName) {
      this.toastrService.error('Empresa não informada.', 'Erro');
      this.localStorageService.clearSupabaseAuthToken();
      this.loadingService.hideLoading();
      return;
    }

    const company = await this.companyService.getByField<any>('companies', 'unique_url', companyName);

    if (!company) {
      this.toastrService.error('Empresa não encontrada.', 'Erro');
      this.localStorageService.clearSupabaseAuthToken();
      this.loadingService.hideLoading();
      return;
    }

    const companyId = company.id;

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        this.toastrService.error('Por favor, confirme seu e-mail antes de continuar.', 'Erro');
        this.loadingService.hideLoading();
        this.isEmailConfirmed.set(false);
        return;
      }

      this.errorHandler.handleError(error.message);
      this.loadingService.hideLoading();
      return;
    }

    const { data: userData, error: userError } = await this.supabase.auth.getUser();

    if (userError || !userData?.user) {
      this.toastrService.error('Erro ao obter dados do usuário.', 'Erro');
      this.localStorageService.clearSupabaseAuthToken();

      this.loadingService.hideLoading();
      return;
    }


    const userId = userData.user.id;

    const userCompany = await this.companyService.getByField<any>('user_companies', 'user_id', userId);

    if (!userCompany || userCompany.company_id !== companyId) {
      this.toastrService.error('Usuário não tem acesso a esta empresa.', 'Erro');
      this.localStorageService.clearSupabaseAuthToken();

      this.loadingService.hideLoading();
      return;
    }

    const firstLogin = userData.user.user_metadata?.['first_login'];
    this.authService.isLogged.set(true);
    this.loadingService.hideLoading();

    if (firstLogin) {
      this.router.navigate(['/auth/reset-password']);
    } else {
      this.router.navigate(['/app'], { queryParams: { empresa: companyName } });
    }
  }

  public async resendConfirmation() {
    this.loadingService.showLoading();

    const { email } = this.dynamicForm.form.value;

    const { error } = await this.supabase.auth.resend({ type: 'signup', email, });

    if (error) {
      this.toastrService.error('Erro ao reenviar o código de confirmação.', 'Erro');
    } else {
      this.toastrService.success('Código de confirmação reenviado com sucesso!', 'Sucesso');
      this.isEmailConfirmed.set(true);
    }

    this.loadingService.hideLoading();
  }

}
