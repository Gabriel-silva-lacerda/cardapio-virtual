import { Component, inject, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '@shared/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/dynamic-form/interfaces/dynamic-filed';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  private supabase = injectSupabase();
  private router = inject(Router);
  private toastr = inject(ToastrService);

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

    this.toastr.success('Login realizado com sucesso!', 'Sucesso!');

    this.router.navigate(['/']);
  }
}
