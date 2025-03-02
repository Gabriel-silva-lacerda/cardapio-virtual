import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private supabase = injectSupabase();
  private router = inject(Router);

  public resetForm!: FormGroup;

  constructor() {
    this.resetForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
    });
  }

  public async submit() {
    if (!this.resetForm.valid) {
      return;
    }

    const { password } = this.resetForm.value;
    console.log(password);

    const { error } = await this.supabase.auth.updateUser({ password: password });
    if (error) {
      console.error('Erro ao atualizar usuário:', error.message);
      return;
    }

    this.resetForm.get('password')?.setValue('');
    this.router.navigate(['/']);

    // const { email } = this.loginForm.value;
    // this.supabase.auth.api.resetPasswordForEmail(email);

  }
}
