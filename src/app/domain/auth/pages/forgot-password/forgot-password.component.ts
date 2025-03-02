import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { LoadingService } from '@shared/services/loading/loading.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
 private supabase = injectSupabase();
 protected loadingService = inject(LoadingService);

  public forgotForm!: FormGroup;

  constructor() {
    this.forgotForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  public async submit() {
    this.loadingService.showLoading();
    if (!this.forgotForm.valid) {
      return;
    }

    const { email } = this.forgotForm.value;
    await this.supabase.auth.resetPasswordForEmail(email);
    this.forgotForm.get('email')?.setValue('');
    this.loadingService.hideLoading();
  }
}
