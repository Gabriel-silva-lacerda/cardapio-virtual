import { Component, inject, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { ButtonModule } from 'primeng/button';
import { LoadingService } from '@shared/services/loading/loading.service';

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

  private supabase = injectSupabase();
  private router = inject(Router);
  private toastr = inject(ToastrService);

  public rings = new Array(6);

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
      return;
    }

    const { email, password } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error logging in:', error.message);
      return;
    }

    this.loadingService.hideLoading();

    this.router.navigate(['/']);
  }
}
